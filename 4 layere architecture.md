import { Component } from "react"

4 Laryers architecture 

1 => UI
   -> Component
   -> pages


2 => Hook => (for managing state and api layer )(last ma create krta hai)
    -> Hooks


3 => State => (data store) 
    -> auth.context.jsx
    -> ai.context.jsx


4 => API => (communication with backend) 
    -> services
        -> auth.api.js