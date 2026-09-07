import { useEffect, useRef, useState } from 'react'
import {
    Bot,
    Send,
    X,
    Minimize2,
    Sparkles,
    User,
    LoaderCircle
} from 'lucide-react'

import { sendAiMessage } from '../api/aiApi'
import '../styles/aiAssistant.css'


function AiAssistant() {

    const [open, setOpen] = useState(false)

    const [message, setMessage] = useState('')

    const [messages, setMessages] = useState([
        {
            id: 1,
            sender: 'ai',
            text:
                'Hi! I’m the Smart Civic AI Assistant. How can I help you?'
        }
    ])

    const [loading, setLoading] = useState(false)

    const messagesEndRef = useRef(null)


    /*
     * =====================================================
     * AUTO SCROLL
     * =====================================================
     */

    useEffect(() => {

        messagesEndRef.current?.scrollIntoView({
            behavior: 'smooth'
        })

    }, [messages, loading])


    /*
     * =====================================================
     * SEND MESSAGE
     * =====================================================
     */

    const handleSend = async () => {

        const trimmedMessage = message.trim()

        if (!trimmedMessage || loading) {
            return
        }


        const userMessage = {
            id: Date.now(),
            sender: 'user',
            text: trimmedMessage
        }


        setMessages(previous => [
            ...previous,
            userMessage
        ])

        setMessage('')
        setLoading(true)


        try {

            const response =
                await sendAiMessage(trimmedMessage)


            const aiReply =
                response?.message


            if (!aiReply) {

                throw new Error(
                    'AI returned an empty response.'
                )
            }


            setMessages(previous => [

                ...previous,

                {
                    id: Date.now() + 1,
                    sender: 'ai',
                    text: aiReply
                }

            ])

        } catch (error) {

            console.error(
                'AI Assistant error:',
                error
            )


            const errorMessage =
                error?.response?.data?.message ||
                error?.message ||
                'Unable to connect to the AI Assistant.'


            setMessages(previous => [

                ...previous,

                {
                    id: Date.now() + 1,
                    sender: 'ai',
                    text: errorMessage,
                    error: true
                }

            ])

        } finally {

            setLoading(false)

        }
    }


    /*
     * =====================================================
     * ENTER KEY
     * =====================================================
     */

    const handleKeyDown = (event) => {

        if (
            event.key === 'Enter' &&
            !event.shiftKey
        ) {

            event.preventDefault()

            handleSend()
        }
    }


    /*
     * =====================================================
     * CLEAR CHAT
     * =====================================================
     */

    const handleNewChat = () => {

        setMessages([
            {
                id: Date.now(),
                sender: 'ai',
                text:
                    'Hi! I’m the Smart Civic AI Assistant. How can I help you?'
            }
        ])

    }


    /*
     * =====================================================
     * AUTH CHECK
     * =====================================================
     */

    const token =
        localStorage.getItem('token')


    if (!token) {
        return null
    }


    return (

        <>

            {/* =================================================
                FLOATING ASSISTANT BUTTON
            ================================================= */}

            {!open && (

                <button
                    type="button"
                    className="ai-assistant-button"
                    onClick={() => setOpen(true)}
                    aria-label="Open AI Assistant"
                    title="AI Assistant"
                >

                    <Sparkles size={23} />

                    <span className="ai-assistant-button-text">
                        AI Assistant
                    </span>

                </button>

            )}


            {/* =================================================
                CHAT WINDOW
            ================================================= */}

            {open && (

                <section
                    className="ai-assistant-window"
                    aria-label="AI Assistant"
                >

                    {/* HEADER */}

                    <header className="ai-assistant-header">

                        <div className="ai-assistant-header-info">

                            <div className="ai-assistant-avatar">

                                <Bot size={21} />

                            </div>

                            <div>

                                <h2>
                                    AI Assistant
                                </h2>

                                <p>
                                    Smart Civic Support
                                </p>

                            </div>

                        </div>


                        <div className="ai-assistant-header-actions">

                            <button
                                type="button"
                                onClick={handleNewChat}
                                title="New chat"
                                aria-label="New chat"
                            >
                                <Minimize2 size={17} />
                            </button>


                            <button
                                type="button"
                                onClick={() => setOpen(false)}
                                title="Close assistant"
                                aria-label="Close assistant"
                            >
                                <X size={19} />
                            </button>

                        </div>

                    </header>


                    {/* MESSAGE AREA */}

                    <div className="ai-assistant-messages">

                        {messages.map(item => (

                            <div
                                key={item.id}
                                className={
                                    item.sender === 'user'
                                        ? 'ai-message-row user-row'
                                        : 'ai-message-row'
                                }
                            >

                                {item.sender === 'ai' && (

                                    <div className="message-avatar ai-avatar">

                                        <Bot size={15} />

                                    </div>

                                )}


                                <div
                                    className={
                                        item.sender === 'user'
                                            ? 'ai-message user-message'
                                            : item.error
                                                ? 'ai-message ai-error-message'
                                                : 'ai-message'
                                    }
                                >

                                    {item.text}

                                </div>


                                {item.sender === 'user' && (

                                    <div className="message-avatar user-avatar">

                                        <User size={15} />

                                    </div>

                                )}

                            </div>

                        ))}


                        {/* LOADING */}

                        {loading && (

                            <div className="ai-message-row">

                                <div className="message-avatar ai-avatar">

                                    <Bot size={15} />

                                </div>

                                <div className="ai-message ai-loading">

                                    <LoaderCircle
                                        size={16}
                                        className="ai-spinner"
                                    />

                                    <span>
                                        Thinking...
                                    </span>

                                </div>

                            </div>

                        )}


                        <div ref={messagesEndRef} />

                    </div>


                    {/* INPUT */}

                    <div className="ai-assistant-input-area">

                        <textarea
                            value={message}
                            onChange={event =>
                                setMessage(event.target.value)
                            }
                            onKeyDown={handleKeyDown}
                            placeholder="Ask about Smart Civic..."
                            rows={1}
                            disabled={loading}
                            aria-label="Message"
                        />


                        <button
                            type="button"
                            onClick={handleSend}
                            disabled={
                                loading ||
                                !message.trim()
                            }
                            aria-label="Send message"
                            title="Send"
                        >

                            {loading
                                ? (
                                    <LoaderCircle
                                        size={18}
                                        className="ai-spinner"
                                    />
                                )
                                : (
                                    <Send size={18} />
                                )
                            }

                        </button>

                    </div>

                    <div className="ai-assistant-footer">

                        AI can make mistakes. Verify important information.

                    </div>

                </section>

            )}

        </>
    )
}


export default AiAssistant