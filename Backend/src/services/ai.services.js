const { GoogleGenAI } = require("@google/genai")
const { z } = require("zod")
const { zodToJsonSchema } = require("zod-to-json-schema")
const puppeteer = require("puppeteer")

const ai = new GoogleGenAI({
    apiKey: process.env.GOOGLE_GENAI_API_KEY
})


const interviewReportSchema = z.object({

    matchScore: z.number()
        .min(0)
        .max(100)
        .describe("A score between 0 and 100 indicating how well the candidate's profile matches the job description"),

    technicalQuestions: z.array(
        z.object({
            question: z.string()
                .describe("A technical question that can be asked in the interview"),

            intention: z.string()
                .describe("The intention of the interviewer behind asking this question"),

            answer: z.string()
                .describe("How the candidate should answer this question and what important points to cover")
        })
    )
    .min(5)
    .describe("At least 5 technical interview questions with intention and answer guidance"),

    behavioralQuestions: z.array(
        z.object({
            question: z.string()
                .describe("A behavioral question that can be asked in the interview"),

            intention: z.string()
                .describe("The intention of the interviewer behind asking this question"),

            answer: z.string()
                .describe("How the candidate should answer this question and what important points to cover")
        })
    )
    .min(5)
    .describe("At least 5 behavioral interview questions with intention and answer guidance"),

    skillGaps: z.array(
        z.object({
            skill: z.string()
                .describe("A skill that the candidate is lacking or needs to improve"),

            severity: z.enum(["low", "medium", "high"])
                .describe("How important this skill gap is for the target job")
        })
    )
    .min(3)
    .describe("At least 3 relevant skill gaps based on the resume and job description"),

    preparationPlan: z.array(
        z.object({
            day: z.number()
                .describe("The day number starting from 1"),

            focus: z.string()
                .describe("The main focus for this preparation day"),

            tasks: z.array(z.string())
                .min(2)
                .describe("At least 2 tasks to complete on this day")
        })
    )
    .min(5)
    .describe("A 5-day interview preparation plan"),

    title: z.string()
        .describe("The job title for which this interview report is generated")
})

async function generateInterviewReport({ resume, selfDescription, jobDescription }) {

    const prompt = `Generate an interview preparation report for this candidate.

You MUST return ONLY valid JSON.

The JSON MUST have exactly this structure:

{
    "title": "React Developer",
    "matchScore": 85,
    "technicalQuestions": [
        {
            "question": "Explain the difference between useState and useReducer in React.",
            "intention": "To evaluate the candidate's understanding of React state management.",
            "answer": "Explain when to use useState, when to use useReducer, and give a practical example."
        }
    ],
    "behavioralQuestions": [
        {
            "question": "Tell me about a challenging project you worked on.",
            "intention": "To evaluate problem-solving and communication skills.",
            "answer": "Explain the situation, your responsibility, the action you took, and the result."
        }
    ],
    "skillGaps": [
        {
            "skill": "Automated Testing",
            "severity": "medium"
        }
    ],
    "preparationPlan": [
        {
            "day": 1,
            "focus": "React fundamentals",
            "tasks": [
                "Revise React hooks",
                "Practice component design"
            ]
        }
    ]
}

IMPORTANT RULES:

- technicalQuestions MUST be an array of objects.
- Each technicalQuestions object MUST contain question, intention and answer.
- behavioralQuestions MUST be an array of objects.
- Each behavioralQuestions object MUST contain question, intention and answer.
- skillGaps MUST be an array of objects.
- Each skillGaps object MUST contain skill and severity.
- preparationPlan MUST be an array of objects.
- Each preparationPlan object MUST contain day, focus and tasks.
- tasks MUST be an array of strings.
- Generate at least 5 technical questions.
- Generate at least 5 behavioral questions.
- Generate at least 3 skill gaps.
- Generate 5 preparation days.
- Each preparation day must have at least 2 tasks.
- matchScore MUST be a number between 0 and 100.
- title MUST be the actual job role.
- DO NOT return arrays containing numbers such as [0,1,2,3,4].
- DO NOT return candidateName, appliedRole, matchScorePercentage, overallEvaluation, strengths, or suggestedInterviewQuestions.
- Return ONLY JSON. No markdown. No explanation.

RESUME:
${resume}

SELF DESCRIPTION:
${selfDescription}

JOB DESCRIPTION:
${jobDescription}
`;

    const models = [
        "gemini-3.8-flash",
        "gemini-3.7-flash",
        "gemini-3.6-flash",
        "gemini-3.5-flash"
    ];

    for (const model of models) {

        try {

            console.log(`Trying Gemini model: ${model}`);

            const response = await ai.models.generateContent({
                model: model,
                contents: prompt,
                config: {
                    responseMimeType: "application/json"
                }
            });

            console.log(`Gemini model ${model} worked successfully`);

            const report = JSON.parse(response.text);

            // Validate the returned structure
            const validTechnicalQuestions =
                Array.isArray(report.technicalQuestions) &&
                report.technicalQuestions.length > 0 &&
                report.technicalQuestions.every(
                    item =>
                        typeof item === "object" &&
                        typeof item.question === "string" &&
                        typeof item.intention === "string" &&
                        typeof item.answer === "string"
                );

            const validBehavioralQuestions =
                Array.isArray(report.behavioralQuestions) &&
                report.behavioralQuestions.length > 0 &&
                report.behavioralQuestions.every(
                    item =>
                        typeof item === "object" &&
                        typeof item.question === "string" &&
                        typeof item.intention === "string" &&
                        typeof item.answer === "string"
                );

            const validSkillGaps =
                Array.isArray(report.skillGaps) &&
                report.skillGaps.length > 0 &&
                report.skillGaps.every(
                    item =>
                        typeof item === "object" &&
                        typeof item.skill === "string" &&
                        ["low", "medium", "high"].includes(item.severity)
                );

            const validPreparationPlan =
                Array.isArray(report.preparationPlan) &&
                report.preparationPlan.length > 0 &&
                report.preparationPlan.every(
                    item =>
                        typeof item === "object" &&
                        typeof item.day === "number" &&
                        typeof item.focus === "string" &&
                        Array.isArray(item.tasks)
                );

            if (
                !validTechnicalQuestions ||
                !validBehavioralQuestions ||
                !validSkillGaps ||
                !validPreparationPlan
            ) {
                console.log("Invalid Gemini response structure.");
                console.log(report);
                throw new Error("Gemini returned an invalid interview report structure.");
            }

            console.log("Generated report title:", report.title);

            return report;

        } catch (error) {

            console.log(`Gemini model ${model} failed`);
            console.log(error.message);

            if (error.status === 503) {
                console.log("Trying next Gemini model...");
                continue;
            }

            if (
                error.message ===
                "Gemini returned an invalid interview report structure."
            ) {
                console.log("Trying the next model because response structure was invalid...");
                continue;
            }

            throw error;
        }
    }

    throw new Error("All Gemini models are currently unavailable.");
}



async function generatePdfFromHtml(htmlContent) {

    if (!htmlContent || typeof htmlContent !== "string") {
        throw new Error("Invalid HTML content received for PDF generation")
    }

    const browser = await puppeteer.launch()

    try {

        const page = await browser.newPage()

        await page.setContent(htmlContent, {
            waitUntil: "networkidle0"
        })

        const pdfBuffer = await page.pdf({
            format: "A4",
            printBackground: true,
            margin: {
                top: "15mm",
                bottom: "15mm",
                left: "12mm",
                right: "12mm"
            }
        })

        return pdfBuffer

    } finally {

        await browser.close()

    }
}
async function generateResumePdf({ resume, selfDescription, jobDescription }) {

    const prompt = `Generate a professional, ATS-friendly resume in HTML format.

RESUME:
${resume}

SELF DESCRIPTION:
${selfDescription}

JOB DESCRIPTION:
${jobDescription}

IMPORTANT:
- Return ONLY valid JSON.
- JSON must contain exactly one field called "html".
- "html" must be a complete HTML document.
- Start the HTML with <!DOCTYPE html>.
- Do not use Markdown.
- Do not use code fences.
- Do not return an interview report.
- The HTML must contain all resume information.
- Make it professional and ATS-friendly.
- Keep it suitable for one A4 page.
`

    const models = [
        "gemini-3.8-flash",
        "gemini-3.7-flash",
        "gemini-3.6-flash",
        "gemini-3.5-flash"
    ]

    for (const model of models) {

        try {

            console.log(`Trying Gemini model: ${model}`)

            const response = await ai.models.generateContent({
                model: model,
                contents: prompt,
                config: {
                    responseMimeType: "application/json"
                }
            })

            console.log(`Gemini model ${model} worked successfully`)

            const jsonContent = JSON.parse(response.text)

            if (
                !jsonContent ||
                typeof jsonContent.html !== "string" ||
                jsonContent.html.trim().length === 0
            ) {
                throw new Error("Gemini did not return valid HTML")
            }

            console.log("Resume HTML received successfully")

            const pdfBuffer = await generatePdfFromHtml(
                jsonContent.html
            )

            console.log("Resume PDF generated successfully")

            return pdfBuffer

        } catch (error) {

            console.log(`Gemini model ${model} failed`)
            console.log(error.message)

            if (error.status === 503) {
                console.log("Trying next model...")
                continue
            }

            throw error
        }
    }

    throw new Error("All Gemini models are currently unavailable.")
}

module.exports = { generateInterviewReport, generateResumePdf }