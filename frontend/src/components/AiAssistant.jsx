import { useEffect, useMemo, useRef, useState } from 'react'
import { useLocation } from 'react-router-dom'
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

    const location = useLocation()

    const [open, setOpen] = useState(false)

    const [message, setMessage] = useState('')

    const [messages, setMessages] = useState([])

    const [loading, setLoading] = useState(false)

    const messagesEndRef = useRef(null)

    const inputRef = useRef(null)


    /*
     * =====================================================
     * AUTHENTICATION
     * =====================================================
     */

    const token = localStorage.getItem('token')


    /*
     * =====================================================
     * CURRENT USER
     * =====================================================
     */

    const storedUser = localStorage.getItem('user')

    const user = useMemo(() => {

        try {

            return storedUser
                ? JSON.parse(storedUser)
                : null

        } catch {

            return null

        }

    }, [storedUser])


    /*
     * =====================================================
     * ROLE
     *
     * Frontend role is ONLY for UX.
     *
     * Backend gets the actual role from the
     * authenticated database user.
     * =====================================================
     */

    const role = user?.role || null


    /*
     * =====================================================
     * ROLE-BASED ASSISTANT CONTENT
     * =====================================================
     */

    const assistantContent = useMemo(() => {

        if (role === 'ADMIN') {

            return {

                roleLabel: 'Administrator',

                welcome:
                    `Hi ${user?.fullName || 'Admin'}! 👋 I’m your Smart Civic AI Assistant. I can help you understand live system statistics, issue management, SLA performance, assignments and worker workload.`,

                suggestions: [
                    'How many total issues are there?',
                    'How many issues are unassigned?',
                    'How many SLA breached issues are there?',
                    'Show category-wise issue statistics',
                    'Show priority-wise issue statistics',
                    'Show worker workload',
                    'How many issues were resolved in the last 7 days?'
                ]

            }
        }


        if (role === 'FIELD_WORKER') {

            return {

                roleLabel: 'Field Worker',

                welcome:
                    `Hi ${user?.fullName || 'Worker'}! 👋 I’m your Smart Civic AI Assistant. I can help you understand your assigned issues, priorities, statuses, SLA information and workload.`,

                suggestions: [
                    'How many issues are assigned to me?',
                    'How many of my issues are in progress?',
                    'How many high priority issues do I have?',
                    'How many of my issues have breached SLA?',
                    'Which of my issues need attention?',
                    'Show my recent assigned issues'
                ]

            }
        }


        return {

            roleLabel: 'Citizen',

            welcome:
                `Hi ${user?.fullName || 'there'}! 👋 I’m your Smart Civic AI Assistant. I can help you understand your reported issues, their current status, SLA information and recent updates.`,

            suggestions: [
                'How many issues have I reported?',
                'How many of my issues are resolved?',
                'How many of my issues are in progress?',
                'Show my recent issues',
                'What is the issue status workflow?',
                'How can I track my reported issue?'
            ]

        }

    }, [role, user?.fullName])


    /*
     * =====================================================
     * PUBLIC PAGES
     * =====================================================
     */

    const isPublicPage =
        location.pathname === '/' ||
        location.pathname === '/login' ||
        location.pathname === '/register' ||
        location.pathname === '/forgot-password' ||
        location.pathname === '/reset-password'


    /*
     * =====================================================
     * INITIAL / ROLE CHANGE MESSAGE
     * =====================================================
     */

    useEffect(() => {

        if (!token || isPublicPage) {
            return
        }

        setMessages([
            {
                id: `welcome-${Date.now()}`,
                sender: 'ai',
                text: assistantContent.welcome,
                suggestions: assistantContent.suggestions,
                welcome: true
            }
        ])

        setMessage('')

    }, [
        token,
        role,
        isPublicPage,
        assistantContent
    ])


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
     * INPUT AUTO FOCUS
     * =====================================================
     */

    useEffect(() => {

        if (!open) {
            return
        }

        const timer = setTimeout(() => {

            inputRef.current?.focus()

        }, 100)

        return () => clearTimeout(timer)

    }, [open])


    /*
     * =====================================================
     * SEND MESSAGE
     * =====================================================
     */

    const handleSend = async (
        customMessage = null
    ) => {

        const textToSend =
            customMessage !== null
                ? customMessage
                : message

        const trimmedMessage =
            textToSend.trim()


        if (
            !trimmedMessage ||
            loading
        ) {
            return
        }


        const userMessage = {

            id: `user-${Date.now()}`,

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
                await sendAiMessage(
                    trimmedMessage
                )


            const aiReply =
                response?.message


            if (
                !aiReply ||
                !aiReply.trim()
            ) {

                throw new Error(
                    'AI returned an empty response.'
                )

            }


            setMessages(previous => [

                ...previous,

                {
                    id: `ai-${Date.now()}`,
                    sender: 'ai',
                    text: aiReply.trim()
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
                    id: `error-${Date.now()}`,
                    sender: 'ai',
                    text: errorMessage,
                    error: true
                }

            ])

        } finally {

            setLoading(false)

            setTimeout(() => {

                inputRef.current?.focus()

            }, 100)

        }

    }


    /*
     * =====================================================
     * SUGGESTION CLICK
     * =====================================================
     */

    const handleSuggestionClick = (
        suggestion
    ) => {

        if (loading) {
            return
        }

        handleSend(suggestion)

    }


    /*
     * =====================================================
     * ENTER KEY
     * =====================================================
     */

    const handleKeyDown = (
        event
    ) => {

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
     * NEW CHAT
     * =====================================================
     */

    const handleNewChat = () => {

        if (loading) {
            return
        }

        setMessages([
            {
                id: `welcome-${Date.now()}`,
                sender: 'ai',
                text: assistantContent.welcome,
                suggestions: assistantContent.suggestions,
                welcome: true
            }
        ])

        setMessage('')

        setTimeout(() => {

            inputRef.current?.focus()

        }, 100)

    }


    /*
     * =====================================================
     * CLOSE ASSISTANT
     * =====================================================
     */

    const handleClose = () => {

        if (loading) {
            return
        }

        setOpen(false)

    }


    /*
     * =====================================================
     * HIDE ASSISTANT
     * =====================================================
     */

    if (
        !token ||
        isPublicPage
    ) {

        return null

    }


    /*
     * =====================================================
     * RENDER
     * =====================================================
     */

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

                    {/* =================================================
                        HEADER
                    ================================================= */}

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
                                disabled={loading}
                                title="New chat"
                                aria-label="New chat"
                            >

                                <Minimize2 size={17} />

                            </button>


                            <button
                                type="button"
                                onClick={handleClose}
                                disabled={loading}
                                title="Close assistant"
                                aria-label="Close assistant"
                            >

                                <X size={19} />

                            </button>

                        </div>

                    </header>


                    {/* =================================================
                        ROLE CONTEXT
                    ================================================= */}

                    <div className="ai-assistant-role-context">

                        <Sparkles size={13} />

                        <span>
                            {assistantContent.roleLabel}
                        </span>

                    </div>


                    {/* =================================================
                        MESSAGE AREA
                    ================================================= */}

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


                                <div>

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


                                    {/* =================================================
                                        INITIAL SUGGESTIONS ONLY
                                    ================================================= */}

                                    {item.sender === 'ai' &&
                                        item.welcome &&
                                        item.suggestions &&
                                        item.suggestions.length > 0 && (

                                            <div className="ai-suggestions">

                                                {item.suggestions.map(
                                                    suggestion => (

                                                        <button
                                                            key={suggestion}
                                                            type="button"
                                                            onClick={() =>
                                                                handleSuggestionClick(
                                                                    suggestion
                                                                )
                                                            }
                                                            disabled={loading}
                                                        >

                                                            {suggestion}

                                                        </button>

                                                    )
                                                )}

                                            </div>

                                        )}

                                </div>


                                {item.sender === 'user' && (

                                    <div className="message-avatar user-avatar">

                                        <User size={15} />

                                    </div>

                                )}

                            </div>

                        ))}


                        {/* =================================================
                            LOADING
                        ================================================= */}

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


                    {/* =================================================
                        INPUT
                    ================================================= */}

                    <div className="ai-assistant-input-area">

                        <textarea
                            ref={inputRef}
                            value={message}
                            onChange={event =>
                                setMessage(
                                    event.target.value
                                )
                            }
                            onKeyDown={handleKeyDown}
                            placeholder="Ask about Smart Civic..."
                            rows={1}
                            disabled={loading}
                            aria-label="Message"
                        />


                        <button
                            type="button"
                            onClick={() => handleSend()}
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


                    {/* =================================================
                        FOOTER
                    ================================================= */}

                    <div className="ai-assistant-footer">

                        AI uses available Smart Civic system information.
                        Verify important information when necessary.

                    </div>

                </section>

            )}

        </>

    )
}


export default AiAssistant