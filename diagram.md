```mermaid
sequenceDiagram
    actor User
    participant GVPage as "Google Voice Page (Content Script)"
    participant BackgroundScript as "Extension Background Script"
    participant LocalLLM as "Local LLM"
    participant GVMessaging as "Google Voice Messaging System"

    User->>GVPage: "Opens Google Voice text message page"
    GVPage->>User: "Injects AI Discussion toggle"
    User->>GVPage: "Toggles AI Discussion ON"

    loop AI Discussion Active
        GVMessaging-->>GVPage: "New incoming message arrives"
        GVPage->>User: "Displays new incoming message"
        GVPage->>BackgroundScript: "Sends new message + conversation context"
        BackgroundScript->>LocalLLM: "Forwards message + context"
        LocalLLM-->>BackgroundScript: "Returns LLM-generated response"
        BackgroundScript-->>GVPage: "Sends LLM response"
        GVPage->>GVMessaging: "Sends LLM response as a new text message"
        GVMessaging-->>User: "Delivers LLM response as text message"
    end

    User->>GVPage: "Toggles AI Discussion OFF"
    GVPage->>GVPage: "Stops forwarding messages to LLM"