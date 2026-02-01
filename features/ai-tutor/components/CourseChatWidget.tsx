import React, { useState, useRef, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { MessageCircle, X, Send, Paperclip, Mic, RefreshCcw, Sparkles, User, FileText, StopCircle, Volume2, Trash2, Loader2 } from 'lucide-react'
import { GoogleGenerativeAI } from '@google/generative-ai'
import ReactMarkdown from 'react-markdown'

interface Message {
    id: string
    role: 'user' | 'model'
    text: string
    timestamp: Date
    attachment?: {
        type: 'file' | 'audio'
        name: string
        url?: string // Data URL for display/playback
        mimeType?: string
    }
}

interface CourseChatWidgetProps {
    courseTitle: string
}

export function CourseChatWidget({ courseTitle }: CourseChatWidgetProps) {
    const [isOpen, setIsOpen] = useState(false)
    const [messages, setMessages] = useState<Message[]>([
        {
            id: 'welcome',
            role: 'model',
            text: `Hello! I'm your AI Tutor for **${courseTitle}**. How can I help you with this topic today?`,
            timestamp: new Date()
        }
    ])
    const [input, setInput] = useState('')
    const [isLoading, setIsLoading] = useState(false)
    const [isRecording, setIsRecording] = useState(false)
    const [attachment, setAttachment] = useState<{ type: 'file' | 'audio', name: string, data: string, mimeType: string, url: string } | null>(null)

    const messagesEndRef = useRef<HTMLDivElement>(null)
    const fileInputRef = useRef<HTMLInputElement>(null)
    const mediaRecorderRef = useRef<MediaRecorder | null>(null)
    const audioChunksRef = useRef<Blob[]>([])

    const API_KEY = import.meta.env.VITE_GEMINI_API_KEY

    const scrollToBottom = () => {
        messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' })
    }

    useEffect(() => {
        scrollToBottom()
    }, [messages, isOpen, attachment])

    // Speak text using browser TTS
    const speak = (text: string) => {
        window.speechSynthesis.cancel() // Stop previous
        const cleanText = text.replace(/[*#_`\[\]]/g, '') // Strip markdown roughly
        const utterance = new SpeechSynthesisUtterance(cleanText)
        utterance.rate = 1
        utterance.pitch = 1
        window.speechSynthesis.speak(utterance)
    }

    // Handle File Attachment
    const handleFileSelect = async (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0]
        if (!file) return

        if (file.size > 5 * 1024 * 1024) { // 5MB limit check
            alert("File is too large. Please upload files under 5MB.")
            return
        }

        const reader = new FileReader()
        reader.onload = () => {
            const dataUrl = reader.result as string
            const base64Data = dataUrl.split(',')[1]
            setAttachment({
                type: 'file',
                name: file.name,
                data: base64Data,
                mimeType: file.type,
                url: dataUrl
            })
        }
        reader.readAsDataURL(file)
    }

    const removeAttachment = () => {
        setAttachment(null)
        if (fileInputRef.current) fileInputRef.current.value = ''
    }

    // Audio Recording
    const startRecording = async () => {
        try {
            const stream = await navigator.mediaDevices.getUserMedia({ audio: true })
            const recorder = new MediaRecorder(stream)
            mediaRecorderRef.current = recorder
            audioChunksRef.current = []

            recorder.ondataavailable = (e) => {
                if (e.data.size > 0) audioChunksRef.current.push(e.data)
            }

            recorder.onstop = () => {
                const audioBlob = new Blob(audioChunksRef.current, { type: 'audio/webm' })
                const reader = new FileReader()
                reader.onloadend = () => {
                    const dataUrl = reader.result as string
                    const base64Data = dataUrl.split(',')[1]
                    setAttachment({
                        type: 'audio',
                        name: 'Voice Message',
                        data: base64Data,
                        mimeType: 'audio/webm',
                        url: dataUrl
                    })
                    setIsRecording(false)
                }
                reader.readAsDataURL(audioBlob)
                stream.getTracks().forEach(track => track.stop()) // Stop mic
            }

            recorder.start()
            setIsRecording(true)
        } catch (err) {
            console.error("Error accessing microphone:", err)
            alert("Could not access microphone.")
        }
    }

    const stopRecording = () => {
        if (mediaRecorderRef.current && isRecording) {
            mediaRecorderRef.current.stop()
        }
    }

    const handleSend = async () => {
        if ((!input.trim() && !attachment) || isLoading) return

        const userMessage: Message = {
            id: Date.now().toString(),
            role: 'user',
            text: input,
            timestamp: new Date(),
            attachment: attachment ? {
                type: attachment.type,
                name: attachment.name,
                url: attachment.url,
                mimeType: attachment.mimeType
            } : undefined
        }

        setMessages(prev => [...prev, userMessage])
        const currentAttachment = attachment // Capture current attachment
        setInput('')
        setAttachment(null) // Clear attachment immediately
        setIsLoading(true)

        try {
            const genAI = new GoogleGenerativeAI(API_KEY)
            // Use gemini-3-flash-preview as requested
            const model = genAI.getGenerativeModel({ model: 'gemini-3-flash-preview' })

            const chat = model.startChat({
                history: messages
                    .filter(m => m.id !== 'welcome')
                    .map(m => ({
                        role: m.role,
                        parts: m.attachment ? [
                            { text: m.text || (m.attachment.type === 'audio' ? 'Audio message sent.' : 'File sent.') },
                            // Note: We can't easily resend history attachments in base64 without storing them all. 
                            // Standard workaround for simple widgets: send text representation of history, 
                            // only send actual base64 for the CURRENT turn. 
                            // BUT Gemini API allows history with parts. 
                            // For this simplified widget, we will only send the text description of past attachments 
                            // to save bandwidth/complexity, but send the ACTUAL attachment for the new message.
                        ] : [{ text: m.text }]
                    })),
            })

            const parts: any[] = []
            if (input.trim()) parts.push({ text: input })
            if (currentAttachment) {
                parts.push({
                    inlineData: {
                        mimeType: currentAttachment.mimeType,
                        data: currentAttachment.data
                    }
                })
            }
            if (parts.length === 0 && currentAttachment) {
                // If only audio/file and no text, provide a default prompt
                parts.push({ text: currentAttachment.type === 'audio' ? "Please transcribe and answer this audio message." : "Please analyze this file." })
            }

            // Improve prompt with context
            const contextPrompt = `Context: The user is studying the course "${courseTitle}". Format answer with Markdown. If user sent audio/file, analyze it.`
            // We append context to the beginning of the text part or as a separate part if possible. 
            // Here, we just prepend to input text or add as text part.
            // Simplified: We assume 'chat' session handles context if we seeded it, but we can't seed system instruction easily in this helper.
            // We'll just send the prompt + parts.

            // Actually, startChat history is strictly validated. 
            // Let's just send the message parts directly.

            // Hack: Prepend context to the text part if it exists, or create a text part
            const finalParts = [
                { text: `${contextPrompt} \n\n ${input}` },
                ...(currentAttachment ? [{
                    inlineData: {
                        mimeType: currentAttachment.mimeType,
                        data: currentAttachment.data
                    }
                }] : [])
            ]

            const result = await chat.sendMessage(finalParts)
            const response = result.response.text()

            const botMessage: Message = {
                id: (Date.now() + 1).toString(),
                role: 'model',
                text: response,
                timestamp: new Date()
            }

            setMessages(prev => [...prev, botMessage])
        } catch (error) {
            console.error('Chat error:', error)
            setMessages(prev => [...prev, {
                id: Date.now().toString(),
                role: 'model',
                text: "I'm having trouble connecting right now. Please check your API key, file size, or permissions.",
                timestamp: new Date()
            }])
        } finally {
            setIsLoading(false)
        }
    }

    const handleKeyPress = (e: React.KeyboardEvent) => {
        if (e.key === 'Enter' && !e.shiftKey) {
            e.preventDefault()
            handleSend()
        }
    }

    return (
        <div className="fixed bottom-8 right-8 z-50 flex flex-col items-end">
            <AnimatePresence>
                {isOpen && (
                    <motion.div
                        initial={{ opacity: 0, scale: 0.9, y: 20 }}
                        animate={{ opacity: 1, scale: 1, y: 0 }}
                        exit={{ opacity: 0, scale: 0.9, y: 20 }}
                        className="bg-white dark:bg-gray-800 rounded-2xl shadow-2xl border border-gray-200 dark:border-gray-700 w-[400px] h-[600px] mb-4 flex flex-col overflow-hidden"
                    >
                        {/* Header */}
                        <div className="p-4 border-b border-gray-100 dark:border-gray-700 bg-white dark:bg-gray-800 flex items-center justify-between sticky top-0 z-10">
                            <div>
                                <div className="text-xs text-gray-500 dark:text-gray-400 mb-0.5">{courseTitle}</div>
                                <div className="flex items-center gap-2">
                                    <div className="bg-indigo-100 dark:bg-indigo-900/50 p-1 rounded-md">
                                        <Sparkles size={14} className="text-indigo-600 dark:text-indigo-400" />
                                    </div>
                                    <span className="font-semibold text-gray-900 dark:text-white">AI Tutor</span>
                                </div>
                            </div>
                            <div className="flex items-center gap-2">
                                <button
                                    onClick={() => setMessages([messages[0]])}
                                    className="p-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-full text-gray-500 transition-colors"
                                    title="Clear Chat"
                                >
                                    <RefreshCcw size={18} />
                                </button>
                                <button
                                    onClick={() => setIsOpen(false)}
                                    className="p-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-full text-gray-500 transition-colors"
                                >
                                    <X size={20} />
                                </button>
                            </div>
                        </div>

                        {/* Messages */}
                        <div className="flex-1 overflow-y-auto p-4 space-y-6 bg-gray-50 dark:bg-gray-900/50">
                            {messages.map((msg) => (
                                <div
                                    key={msg.id}
                                    className={`flex gap-3 ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}
                                >
                                    {msg.role === 'model' && (
                                        <div className="flex flex-col gap-2">
                                            <div className="w-8 h-8 bg-indigo-600 rounded-full flex items-center justify-center flex-shrink-0 mt-1">
                                                <Sparkles size={16} className="text-white" />
                                            </div>
                                            <button
                                                onClick={() => speak(msg.text)}
                                                className="w-8 h-8 bg-indigo-100 hover:bg-indigo-200 rounded-full flex items-center justify-center text-indigo-700 transition-colors"
                                                title="Read Aloud"
                                            >
                                                <Volume2 size={14} />
                                            </button>
                                        </div>
                                    )}

                                    <div className={`max-w-[85%] flex flex-col gap-2 ${msg.role === 'user' ? 'items-end' : 'items-start'}`}>
                                        {/* Attachment Display */}
                                        {msg.attachment && (
                                            <div className="bg-gray-100 dark:bg-gray-700 rounded-xl p-3 flex items-center gap-3">
                                                {msg.attachment.type === 'file' ? (
                                                    <>
                                                        <FileText size={20} className="text-indigo-600" />
                                                        <div className="text-xs truncate max-w-[150px]">{msg.attachment.name}</div>
                                                    </>
                                                ) : (
                                                    <audio controls src={msg.attachment.url} className="h-8 w-48" />
                                                )}
                                            </div>
                                        )}

                                        {msg.text && (
                                            <div
                                                className={`rounded-2xl p-4 shadow-sm ${msg.role === 'user'
                                                        ? 'bg-white border border-gray-200 text-gray-900 dark:bg-gray-700 dark:text-gray-100 rounded-tr-none'
                                                        : 'bg-indigo-50 border border-indigo-100 text-gray-800 dark:bg-indigo-900/30 dark:border-indigo-800 dark:text-indigo-100 rounded-tl-none'
                                                    }`}
                                            >
                                                <div className="text-sm leading-relaxed">
                                                    <ReactMarkdown
                                                        components={{
                                                            ul: ({ node, ...props }) => <ul className="list-disc pl-4 space-y-1 my-2" {...props} />,
                                                            ol: ({ node, ...props }) => <ol className="list-decimal pl-4 space-y-1 my-2" {...props} />,
                                                            h1: ({ node, ...props }) => <h1 className="text-lg font-bold mt-3 mb-2" {...props} />,
                                                            h2: ({ node, ...props }) => <h2 className="text-base font-bold mt-3 mb-2" {...props} />,
                                                            h3: ({ node, ...props }) => <h3 className="text-sm font-bold mt-2 mb-1" {...props} />,
                                                            p: ({ node, ...props }) => <p className="mb-2 last:mb-0" {...props} />,
                                                            strong: ({ node, ...props }) => <strong className="font-semibold" {...props} />,
                                                            li: ({ node, ...props }) => <li className="pl-1" {...props} />,
                                                            code: ({ node, className, children, ...props }: any) => {
                                                                const match = /language-(\w+)/.exec(className || '')
                                                                return !String(children).includes('\n') ? (
                                                                    <code className="bg-gray-100 dark:bg-gray-800 px-1 py-0.5 rounded text-xs font-mono" {...props}>
                                                                        {children}
                                                                    </code>
                                                                ) : (
                                                                    <code className="block bg-gray-100 dark:bg-gray-800 p-2 rounded text-xs font-mono overflow-x-auto my-2" {...props}>
                                                                        {children}
                                                                    </code>
                                                                )
                                                            }
                                                        }}
                                                    >
                                                        {msg.text}
                                                    </ReactMarkdown>
                                                </div>
                                                <div className="text-[10px] opacity-50 mt-2 text-right">
                                                    {msg.timestamp.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                                                </div>
                                            </div>
                                        )}
                                    </div>

                                    {msg.role === 'user' && (
                                        <div className="w-8 h-8 bg-gray-200 dark:bg-gray-700 rounded-full flex items-center justify-center flex-shrink-0 mt-1">
                                            <User size={16} className="text-gray-500 dark:text-gray-400" />
                                        </div>
                                    )}
                                </div>
                            ))}
                            {isLoading && (
                                <div className="flex gap-3">
                                    <div className="w-8 h-8 bg-indigo-600 rounded-full flex items-center justify-center flex-shrink-0">
                                        <Sparkles size={16} className="text-white" />
                                    </div>
                                    <div className="bg-white border border-gray-200 dark:bg-gray-700 dark:border-gray-600 rounded-2xl rounded-tl-none p-4 shadow-sm">
                                        <div className="flex gap-1.5">
                                            <div className="w-2 h-2 bg-indigo-400 rounded-full animate-bounce" style={{ animationDelay: '0ms' }} />
                                            <div className="w-2 h-2 bg-indigo-400 rounded-full animate-bounce" style={{ animationDelay: '150ms' }} />
                                            <div className="w-2 h-2 bg-indigo-400 rounded-full animate-bounce" style={{ animationDelay: '300ms' }} />
                                        </div>
                                    </div>
                                </div>
                            )}
                            <div ref={messagesEndRef} />
                        </div>

                        {/* Input Area */}
                        <div className="p-4 bg-white dark:bg-gray-800 border-t border-gray-100 dark:border-gray-700">
                            {/* Attachment Preview */}
                            {attachment && (
                                <div className="mb-3 flex items-center gap-2 bg-indigo-50 dark:bg-gray-700 p-2 rounded-lg border border-indigo-100 dark:border-gray-600 w-fit">
                                    {attachment.type === 'file' ? <FileText size={16} className="text-indigo-600" /> : <Mic size={16} className="text-red-500" />}
                                    <span className="text-xs font-medium truncate max-w-[200px]">{attachment.name}</span>
                                    <button onClick={removeAttachment} className="ml-2 hover:bg-gray-200 rounded-full p-1">
                                        <Trash2 size={12} className="text-gray-500" />
                                    </button>
                                </div>
                            )}

                            <div className="relative">
                                <textarea
                                    value={input}
                                    onChange={(e) => setInput(e.target.value)}
                                    onKeyDown={handleKeyPress}
                                    placeholder={isRecording ? "Listening..." : "Ask anything or attach a file..."}
                                    disabled={isRecording}
                                    className="w-full bg-gray-50 dark:bg-gray-900 border border-gray-200 dark:border-gray-700 rounded-xl pl-4 pr-32 py-3 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent resize-none h-[52px] max-h-32 text-sm scrollbar-hide disabled:bg-red-50 disabled:border-red-100 transition-colors"
                                />
                                <div className="absolute right-2 top-1.5 flex items-center gap-1 bg-white dark:bg-gray-800 rounded-lg p-1 border border-gray-100 dark:border-gray-700 shadow-sm">
                                    <input
                                        type="file"
                                        ref={fileInputRef}
                                        className="hidden"
                                        accept=".pdf,image/*"
                                        onChange={handleFileSelect}
                                    />
                                    <button
                                        onClick={() => fileInputRef.current?.click()}
                                        disabled={isRecording}
                                        className="p-1.5 text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 transition-colors disabled:opacity-50"
                                    >
                                        <Paperclip size={16} />
                                    </button>

                                    <button
                                        onClick={isRecording ? stopRecording : startRecording}
                                        className={`p-1.5 transition-colors rounded-md ${isRecording
                                                ? 'bg-red-100 text-red-600 hover:bg-red-200 animate-pulse'
                                                : 'text-gray-400 hover:text-gray-600 dark:hover:text-gray-300'
                                            }`}
                                    >
                                        {isRecording ? <StopCircle size={16} /> : <Mic size={16} />}
                                    </button>

                                    <button
                                        onClick={handleSend}
                                        disabled={(!input.trim() && !attachment) || isLoading || isRecording}
                                        className="p-1.5 bg-indigo-600 text-white rounded-md hover:bg-indigo-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                                    >
                                        {isLoading ? <Loader2 size={16} className="animate-spin" /> : <Send size={16} />}
                                    </button>
                                </div>
                            </div>
                            <div className="text-center mt-2 text-[10px] text-gray-400">
                                AI can make mistakes. Please verify important information.
                            </div>
                        </div>
                    </motion.div>
                )}
            </AnimatePresence>

            <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={() => setIsOpen(!isOpen)}
                className="w-14 h-14 bg-indigo-600 hover:bg-indigo-700 text-white rounded-full shadow-lg hover:shadow-xl transition-all flex items-center justify-center z-50 overflow-hidden"
            >
                <AnimatePresence mode="wait">
                    {isOpen ? (
                        <motion.div
                            key="close"
                            initial={{ rotate: -90, opacity: 0 }}
                            animate={{ rotate: 0, opacity: 1 }}
                            exit={{ rotate: 90, opacity: 0 }}
                        >
                            <X size={28} />
                        </motion.div>
                    ) : (
                        <motion.div
                            key="chat"
                            initial={{ rotate: 90, opacity: 0 }}
                            animate={{ rotate: 0, opacity: 1 }}
                            exit={{ rotate: -90, opacity: 0 }}
                        >
                            <MessageCircle size={28} />
                        </motion.div>
                    )}
                </AnimatePresence>
            </motion.button>
        </div>
    )
}
