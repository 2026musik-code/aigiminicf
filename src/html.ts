export const html = `<!DOCTYPE html>
<html lang="en" class="dark">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>GIMINI CF V3</title>
    <script src="https://cdn.tailwindcss.com?plugins=typography"></script>
    <script defer src="https://cdn.jsdelivr.net/npm/alpinejs@3.x.x/dist/cdn.min.js"></script>
    <script src="https://cdn.jsdelivr.net/npm/marked/marked.min.js"></script>
    <link rel="stylesheet" href="https://cdnjs.cloudflare.com/ajax/libs/highlight.js/11.9.0/styles/atom-one-dark.min.css">
    <script src="https://cdnjs.cloudflare.com/ajax/libs/highlight.js/11.9.0/highlight.min.js"></script>
    <style>
        /* Custom Scrollbar */
        ::-webkit-scrollbar { width: 8px; }
        ::-webkit-scrollbar-track { background: #1f2937; }
        ::-webkit-scrollbar-thumb { background: #4b5563; border-radius: 4px; }
        ::-webkit-scrollbar-thumb:hover { background: #6b7280; }
        .glass {
            background: rgba(17, 24, 39, 0.7);
            backdrop-filter: blur(10px);
            -webkit-backdrop-filter: blur(10px);
            border-bottom: 1px solid rgba(255, 255, 255, 0.1);
        }
        .message-content p { margin-bottom: 0.5rem; }
        .message-content p:last-child { margin-bottom: 0; }
        .message-content pre { margin: 0; padding: 0; background: transparent; border-radius: 0; }
        .message-content :not(pre) > code {
            background: #374151;
            padding: 0.2rem 0.4rem;
            border-radius: 0.25rem;
            font-size: 0.875em;
            color: #e5e7eb;
        }
        /* Premium Typography Styles */
        .message-content {
            overflow-wrap: break-word;
            word-wrap: break-word;
            word-break: break-word;
        }
        .message-content h1, .message-content h2, .message-content h3, .message-content h4 {
            background: linear-gradient(to right, #60a5fa, #c084fc); /* blue-400 to purple-400 */
            -webkit-background-clip: text;
            background-clip: text;
            color: transparent;
            margin-top: 1.5rem;
            margin-bottom: 0.75rem;
            font-weight: 800;
            line-height: 1.3;
            width: fit-content; /* Ensure gradient applies correctly on wrap */
        }
        .message-content h1 { font-size: 1.5em; }
        .message-content h2 { font-size: 1.25em; }
        .message-content h3 { font-size: 1.1em; }

        .message-content strong, .message-content b {
            color: #818cf8; /* Indigo-400 */
            font-weight: 700;
        }

        .message-content ul, .message-content ol {
            margin-top: 0.5rem;
            margin-bottom: 0.5rem;
            padding-left: 1.25rem;
        }
        .message-content li {
            margin-bottom: 0.25rem;
            position: relative;
        }
        .message-content ul > li::marker {
            color: #c084fc; /* Purple-400 */
        }

        .message-content blockquote {
            border-left: 4px solid #c084fc;
            background: rgba(192, 132, 252, 0.1);
            padding: 0.5rem 1rem;
            border-radius: 0 0.5rem 0.5rem 0;
            color: #e9d5ff; /* Purple-100 */
            font-style: italic;
            margin: 1rem 0;
        }

        .message-content table {
            display: block; /* Allows scrolling */
            overflow-x: auto;
            width: 100%;
            border-collapse: collapse;
            margin: 1rem 0;
            font-size: 0.9em;
            border-radius: 0.5rem;
            border: 1px solid #374151;
            white-space: nowrap; /* Keep table cells from breaking too aggressively */
        }
        .message-content th {
            background: #1f2937;
            color: #60a5fa;
            font-weight: 600;
            text-align: left;
            padding: 0.75rem;
            border-bottom: 1px solid #374151;
        }
        .message-content td {
            padding: 0.75rem;
            border-bottom: 1px solid #374151;
            color: #d1d5db;
        }
        .message-content tr:last-child td { border-bottom: none; }

        .shimmer {
            background: linear-gradient(to right, #4f46e5 0%, #ec4899 50%, #4f46e5 100%);
            background-size: 200% auto;
            color: transparent;
            -webkit-background-clip: text;
            background-clip: text;
            animation: shine 3s linear infinite;
        }
        @keyframes shine {
            to {
                background-position: 200% center;
            }
        }
    </style>
    <script>
        tailwind.config = {
            darkMode: 'class',
            theme: {
                extend: {
                    colors: {
                        primary: '#6366f1', // Indigo 500
                        secondary: '#ec4899', // Pink 500
                    },
                    animation: {
                        'pulse-slow': 'pulse 3s cubic-bezier(0.4, 0, 0.6, 1) infinite',
                    }
                }
            }
        }
    </script>
</head>
<body class="bg-gray-900 text-white h-screen flex overflow-hidden"
      x-data="app()"
      @preview-request.window="openPreviewModal($event.detail)">

    <!-- Sidebar Overlay -->
    <div x-show="sidebarOpen"
         x-transition:enter="transition-opacity ease-linear duration-300"
         x-transition:enter-start="opacity-0"
         x-transition:enter-end="opacity-100"
         x-transition:leave="transition-opacity ease-linear duration-300"
         x-transition:leave-start="opacity-100"
         x-transition:leave-end="opacity-0"
         class="fixed inset-0 bg-gray-900/80 z-40 lg:hidden"
         @click="sidebarOpen = false"></div>

    <!-- Sidebar -->
    <aside :class="sidebarOpen ? 'translate-x-0' : '-translate-x-full'" class="fixed inset-y-0 left-0 z-50 w-72 bg-gray-900 border-r border-gray-800 transform transition-transform duration-300 ease-in-out lg:translate-x-0 lg:static lg:inset-0 flex flex-col shrink-0">
        <!-- Sidebar Header (Updated Logo) -->
        <div class="h-20 flex items-center px-6 border-b border-gray-800">
             <div class="flex items-center gap-3">
                <div class="relative w-10 h-10">
                    <div class="absolute inset-0 bg-gradient-to-tr from-blue-500 via-purple-500 to-pink-500 rounded-full blur opacity-75 animate-pulse"></div>
                    <div class="relative w-full h-full bg-gray-900 rounded-full flex items-center justify-center border border-white/10">
                        <span class="text-xl font-bold bg-gradient-to-r from-blue-400 to-purple-500 bg-clip-text text-transparent">G</span>
                    </div>
                </div>
                <div class="flex flex-col">
                    <h1 class="font-bold text-lg tracking-wide shimmer">GIMINI</h1>
                    <span class="text-[10px] text-gray-500 tracking-[0.2em] font-mono">CF V3</span>
                </div>
            </div>
        </div>

        <!-- New Chat Button -->
        <div class="p-4">
            <button @click="newChat" class="w-full flex items-center justify-center gap-2 bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-500 hover:to-purple-500 text-white py-3 rounded-xl transition shadow-lg shadow-indigo-500/20 font-medium group border border-white/5">
                <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="group-hover:rotate-90 transition-transform"><line x1="12" y1="5" x2="12" y2="19"></line><line x1="5" y1="12" x2="19" y2="12"></line></svg>
                New Chat
            </button>
        </div>

        <!-- History List (With Delete) -->
        <div class="flex-1 overflow-y-auto px-2 py-2 space-y-1">
            <div class="px-4 py-2 text-xs font-semibold text-gray-500 uppercase tracking-wider flex justify-between items-center">
                <span>History</span>
            </div>
            <template x-for="session in sessions" :key="session.id">
                <div class="group relative flex items-center">
                    <button @click="loadSession(session.id)"
                        :class="currentSessionId === session.id ? 'bg-gray-800 text-white' : 'text-gray-400 hover:bg-gray-800/50 hover:text-white'"
                        class="flex-1 text-left px-4 py-3 rounded-lg transition truncate text-sm flex items-center gap-3 pr-10">
                        <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="opacity-50 group-hover:opacity-100 shrink-0"><path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"></path></svg>
                        <span x-text="session.title" class="truncate"></span>
                    </button>
                    <!-- Delete Button (Appears on Hover) -->
                    <button @click.stop="deleteSession(session.id)" class="absolute right-2 p-1.5 rounded-md text-gray-500 hover:text-red-400 hover:bg-red-500/10 opacity-0 group-hover:opacity-100 transition-all focus:opacity-100">
                        <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><polyline points="3 6 5 6 21 6"></polyline><path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"></path></svg>
                    </button>
                </div>
            </template>
             <template x-if="sessions.length === 0">
                <div class="px-4 py-8 text-center text-gray-600 text-sm italic flex flex-col items-center gap-2">
                    <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round" class="opacity-30"><path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"></path></svg>
                    <span>No history yet</span>
                </div>
            </template>
        </div>

        <!-- User/Settings Footer -->
         <div class="p-4 border-t border-gray-800 flex flex-col gap-2">
            <button @click="openGitHub = true" class="flex items-center gap-3 w-full text-gray-400 hover:text-white hover:bg-gray-800/50 p-2 rounded-lg transition group">
                <div class="w-8 h-8 rounded-full bg-gray-800 border border-gray-700 flex items-center justify-center group-hover:border-indigo-500/50 transition-colors">
                    <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M9 19c-5 1.5-5-2.5-7-3m14 6v-3.87a3.37 3.37 0 0 0-.94-2.61c3.14-.35 6.44-1.54 6.44-7A5.44 5.44 0 0 0 20 4.77 5.07 5.07 0 0 0 19.91 1S18.73.65 16 2.48a13.38 13.38 0 0 0-7 0C6.27.65 5.09 1 5.09 1A5.07 5.07 0 0 0 5 4.77a5.44 5.44 0 0 0-1.5 3.78c0 5.42 3.3 6.61 6.44 7A3.37 3.37 0 0 0 9 18.13V22"></path></svg>
                </div>
                <div class="text-sm font-medium">GitHub</div>
            </button>
            <button @click="openSettings = true" class="flex items-center gap-3 w-full text-gray-400 hover:text-white hover:bg-gray-800/50 p-2 rounded-lg transition group">
                <div class="w-8 h-8 rounded-full bg-gray-800 border border-gray-700 flex items-center justify-center group-hover:border-indigo-500/50 transition-colors">
                    <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"></path><circle cx="12" cy="7" r="4"></circle></svg>
                </div>
                <div class="text-sm font-medium">Settings</div>
            </button>
        </div>
    </aside>

    <!-- Main Content -->
    <div class="flex-1 flex flex-col h-full relative w-full">
        <!-- Header (Mobile Menu + Title) -->
        <header class="glass h-16 flex items-center justify-between px-4 z-10 shrink-0 lg:hidden">
            <button @click="sidebarOpen = true" class="p-2 -ml-2 rounded-lg hover:bg-gray-800 text-gray-400 hover:text-white">
                <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><line x1="3" y1="12" x2="21" y2="12"></line><line x1="3" y1="6" x2="21" y2="6"></line><line x1="3" y1="18" x2="21" y2="18"></line></svg>
            </button>
            <div class="flex items-center gap-2">
                <div class="w-6 h-6 rounded-full bg-gradient-to-tr from-blue-500 to-purple-500 flex items-center justify-center text-[10px] font-bold">G</div>
                <h1 class="font-bold text-lg tracking-wide text-white">GIMINI</h1>
            </div>
            <div class="w-8"></div>
        </header>

        <!-- Chat Area -->
        <main class="flex-1 overflow-y-auto p-4 flex flex-col gap-4 relative scroll-smooth w-full" id="chat-container">

            <!-- Welcome Message -->
            <template x-if="messages.length === 0">
                <div class="flex flex-col items-center justify-center h-full text-gray-500 gap-6 opacity-50">
                    <div class="relative w-24 h-24">
                        <div class="absolute inset-0 bg-gradient-to-tr from-blue-500 to-purple-500 rounded-full blur-xl opacity-30 animate-pulse-slow"></div>
                        <div class="relative w-full h-full bg-gray-800/80 backdrop-blur rounded-full flex items-center justify-center shadow-inner border border-white/5">
                            <svg xmlns="http://www.w3.org/2000/svg" width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round" class="text-indigo-400"><path d="M12 2a10 10 0 1 0 10 10 4 4 0 0 1-5-5 4 4 0 0 1-5-5"></path><path d="M8.5 8.5v.01"></path><path d="M16 15.5v.01"></path><path d="M12 12v.01"></path></svg>
                        </div>
                    </div>
                    <div class="text-center">
                        <p class="text-xl font-light text-white mb-2">Welcome to <span class="font-bold bg-clip-text text-transparent bg-gradient-to-r from-blue-400 to-purple-500">GIMINI CF V3</span></p>
                        <p class="text-sm text-gray-500">Start a conversation with advanced AI</p>
                    </div>
                </div>
            </template>

            <!-- Messages -->
            <template x-for="(msg, index) in messages" :key="index">
                <div :class="msg.role === 'user' ? 'self-end max-w-[90%] md:max-w-[75%]' : 'self-start max-w-[95%] lg:max-w-[90%] w-full'" class="animate-fade-in-up transition-all duration-300">
                    <div :class="msg.role === 'user' ? 'bg-indigo-600 rounded-br-none text-white shadow-indigo-500/10' : 'bg-gray-800 border border-gray-700 rounded-bl-none text-gray-100 shadow-black/20'" class="p-4 rounded-2xl shadow-lg relative group">
                        <!-- Label -->
                        <div class="text-[10px] uppercase tracking-wider opacity-50 mb-1 font-semibold flex items-center gap-1">
                            <span x-text="msg.role === 'user' ? 'You' : 'Gemini'"></span>
                            <span x-show="msg.role === 'model'" class="w-1.5 h-1.5 rounded-full bg-green-400 inline-block ml-1"></span>
                        </div>
                        <!-- Content -->
                        <template x-if="msg.image">
                            <div class="mb-2">
                                <img :src="msg.image.data ? ('data:' + msg.image.mimeType + ';base64,' + msg.image.data) : msg.image" class="max-w-full h-auto max-h-64 rounded-lg border border-gray-700">
                            </div>
                        </template>

                        <!-- PR Proposal Card -->
                        <template x-if="msg.prProposal">
                            <div class="bg-gray-900 border border-indigo-500/30 rounded-xl p-4 mb-3 shadow-lg shadow-indigo-500/10">
                                <div class="flex items-center gap-2 mb-2">
                                    <div class="w-8 h-8 rounded-full bg-indigo-500/20 flex items-center justify-center text-indigo-400">
                                        <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="18" cy="18" r="3"></circle><circle cx="6" cy="6" r="3"></circle><path d="M13 6h3a2 2 0 0 1 2 2v7"></path><line x1="6" y1="9" x2="6" y2="21"></line></svg>
                                    </div>
                                    <div>
                                        <h3 class="text-sm font-bold text-white">Proposed Change</h3>
                                        <div class="text-[10px] text-gray-400 font-mono" x-text="msg.prProposal.repoName"></div>
                                    </div>
                                </div>

                                <div class="space-y-2 mb-4">
                                    <div class="flex gap-2 text-xs">
                                        <span class="text-gray-500 w-16 uppercase tracking-wider font-semibold">File</span>
                                        <span class="text-gray-300 font-mono bg-gray-800 px-1 rounded truncate" x-text="msg.prProposal.filePath"></span>
                                    </div>
                                    <div class="flex gap-2 text-xs">
                                        <span class="text-gray-500 w-16 uppercase tracking-wider font-semibold">Message</span>
                                        <span class="text-gray-300 italic truncate" x-text="msg.prProposal.commitMessage"></span>
                                    </div>
                                </div>

                                <div class="flex gap-2">
                                    <button @click="openPreviewModal(msg.prProposal.content)" class="flex-1 bg-gray-800 hover:bg-gray-700 text-gray-300 py-2 rounded-lg text-xs font-bold transition border border-gray-700">
                                        Review Code
                                    </button>
                                    <button @click="createPR(msg.prProposal, index)" :disabled="msg.prCreated"
                                        class="flex-1 bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-500 hover:to-purple-500 text-white py-2 rounded-lg text-xs font-bold transition shadow-lg shadow-indigo-500/20 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2">
                                        <span x-text="msg.prCreated ? 'PR Created' : 'Create Pull Request'"></span>
                                        <svg x-show="!msg.prCreated" xmlns="http://www.w3.org/2000/svg" width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><polyline points="9 18 15 12 9 6"></polyline></svg>
                                    </button>
                                </div>
                                <div x-show="msg.prUrl" class="mt-3 text-center">
                                    <a :href="msg.prUrl" target="_blank" class="text-xs text-blue-400 hover:text-blue-300 underline decoration-blue-500/30 hover:decoration-blue-300">View Pull Request on GitHub &rarr;</a>
                                </div>
                            </div>
                        </template>

                        <div class="message-content prose prose-invert prose-sm max-w-none leading-relaxed" x-html="parseMarkdown(msg.content)"></div>

                        <!-- Copy Button (for AI full text) -->
                        <button x-show="msg.role === 'model' && !msg.prProposal" @click="copyToClipboard(msg.content)" class="absolute top-2 right-2 opacity-0 group-hover:opacity-100 transition p-1.5 rounded-md hover:bg-gray-700 text-gray-400 hover:text-white" title="Copy entire message">
                             <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><rect x="9" y="9" width="13" height="13" rx="2" ry="2"></rect><path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1"></path></svg>
                        </button>
                    </div>
                </div>
            </template>

            <!-- Loading Indicator -->
            <div x-show="isLoading" class="self-start max-w-[70%]">
                 <div class="bg-gray-800 border border-gray-700 p-4 rounded-2xl rounded-bl-none shadow-lg flex items-center gap-2">
                    <span class="text-xs text-gray-400 mr-2 font-mono tracking-widest animate-pulse">THINKING</span>
                    <div class="flex gap-1">
                        <div class="w-1.5 h-1.5 bg-indigo-400 rounded-full animate-bounce"></div>
                        <div class="w-1.5 h-1.5 bg-indigo-400 rounded-full animate-bounce" style="animation-delay: 0.2s"></div>
                        <div class="w-1.5 h-1.5 bg-indigo-400 rounded-full animate-bounce" style="animation-delay: 0.4s"></div>
                    </div>
                 </div>
            </div>

        </main>

        <!-- Input Area -->
        <footer class="p-4 pb-8 md:pb-4 bg-gray-900/95 backdrop-blur border-t border-gray-800 shrink-0">
            <form @submit.prevent="sendMessage" class="max-w-4xl mx-auto relative flex flex-col gap-2">
                <!-- Image Preview -->
                <div x-show="selectedImage" class="flex items-center gap-2 p-2 bg-gray-800/50 rounded-lg w-fit animate-fade-in-up" style="display: none;">
                    <div class="relative group">
                        <img :src="selectedImage" class="h-16 w-auto rounded-md object-cover border border-gray-700">
                        <button type="button" @click="clearImage" class="absolute -top-1 -right-1 bg-red-500 text-white rounded-full p-0.5 shadow-sm hover:bg-red-600 transition">
                            <svg xmlns="http://www.w3.org/2000/svg" width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="3" stroke-linecap="round" stroke-linejoin="round"><line x1="18" y1="6" x2="6" y2="18"></line><line x1="6" y1="6" x2="18" y2="18"></line></svg>
                        </button>
                    </div>
                    <span class="text-xs text-gray-400">Image attached</span>
                </div>

                <div class="flex gap-3 items-end w-full">
                    <div class="relative flex-1 flex items-center">
                        <input x-ref="fileInput" type="file" accept="image/*" class="hidden" @change="handleFileUpload">
                        <input type="text" x-model="userInput" :disabled="isLoading" placeholder="Ask anything..."
                            class="w-full bg-gray-800/50 text-white rounded-2xl pl-24 pr-6 py-4 focus:outline-none focus:ring-2 focus:ring-indigo-500/50 border border-gray-700/50 placeholder-gray-500 disabled:opacity-50 transition-all shadow-inner backdrop-blur-sm focus:bg-gray-800">

                        <div class="absolute left-2 flex items-center gap-1 z-10">
                            <!-- Camera Button -->
                             <button type="button" @click="startCamera" class="p-2 text-gray-400 hover:text-white transition rounded-full hover:bg-gray-700/50" title="Camera">
                                <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M23 19a2 2 0 0 1-2 2H3a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h4l2-3h6l2 3h4a2 2 0 0 1 2 2z"></path><circle cx="12" cy="13" r="4"></circle></svg>
                            </button>
                            <!-- Attach Button -->
                            <button type="button" @click="$refs.fileInput.click()" class="p-2 text-gray-400 hover:text-white transition rounded-full hover:bg-gray-700/50" title="Attach Image">
                                <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><rect x="3" y="3" width="18" height="18" rx="2" ry="2"></rect><circle cx="8.5" cy="8.5" r="1.5"></circle><polyline points="21 15 16 10 5 21"></polyline></svg>
                            </button>
                        </div>
                    </div>
                    <button type="submit" :disabled="isLoading || (!userInput.trim() && !selectedImage)"
                        class="bg-gradient-to-br from-indigo-600 to-purple-600 hover:from-indigo-500 hover:to-purple-500 text-white rounded-xl p-4 disabled:opacity-50 disabled:cursor-not-allowed transition-all shadow-lg shadow-indigo-500/20 hover:shadow-indigo-500/40 flex items-center justify-center transform hover:scale-105 active:scale-95 h-[58px] w-[58px]">
                        <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><line x1="22" y1="2" x2="11" y2="13"></line><polygon points="22 2 15 22 11 13 2 9 22 2"></polygon></svg>
                    </button>
                </div>
            </form>
            <div class="text-center text-[10px] text-gray-600 mt-3 font-mono">Powered by Google Gemini 3 Flash Preview</div>
        </footer>
    </div>

    <!-- Camera Modal -->
    <div x-show="cameraOpen" style="display: none;" class="fixed inset-0 z-50 bg-black flex flex-col"
        x-transition:enter="transition ease-out duration-300"
        x-transition:enter-start="opacity-0 scale-95"
        x-transition:enter-end="opacity-100 scale-100"
        x-transition:leave="transition ease-in duration-200"
        x-transition:leave-start="opacity-100 scale-100"
        x-transition:leave-end="opacity-0 scale-95">

        <div class="relative flex-1 bg-black overflow-hidden flex items-center justify-center">
            <video x-ref="videoPreview" autoplay playsinline class="absolute inset-0 w-full h-full object-cover"></video>
            <!-- Camera Grid Overlay -->
            <div class="absolute inset-0 pointer-events-none opacity-30">
                <div class="absolute top-1/3 left-0 right-0 h-px bg-white"></div>
                <div class="absolute bottom-1/3 left-0 right-0 h-px bg-white"></div>
                <div class="absolute left-1/3 top-0 bottom-0 w-px bg-white"></div>
                <div class="absolute right-1/3 top-0 bottom-0 w-px bg-white"></div>
            </div>

            <!-- Live Text Overlay -->
            <div x-show="liveMode && liveText" class="absolute bottom-8 left-4 right-4 bg-black/60 backdrop-blur-md text-white p-4 rounded-xl text-center transition-all duration-300">
                <p x-text="liveText" class="text-sm font-medium animate-pulse"></p>
            </div>

            <canvas x-ref="canvasCapture" class="hidden"></canvas>
        </div>

        <!-- Controls -->
        <div class="h-32 bg-black/80 backdrop-blur flex flex-col shrink-0 z-20 pb-4">

            <!-- Mode Switcher -->
            <div class="flex justify-center items-center gap-4 py-2">
                <button @click="toggleLiveMode" :class="liveMode ? 'text-green-400 bg-green-900/30' : 'text-gray-400'" class="px-3 py-1 rounded-full text-xs font-bold tracking-wider uppercase transition flex items-center gap-2">
                    <div :class="liveMode ? 'animate-pulse bg-green-500' : 'bg-gray-500'" class="w-2 h-2 rounded-full"></div>
                    Live Analysis
                </button>
            </div>

            <div class="flex items-center justify-between px-8 pb-4">
                <button @click="stopCamera" class="text-white p-4 rounded-full bg-gray-800 hover:bg-gray-700 transition">
                    <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><line x1="18" y1="6" x2="6" y2="18"></line><line x1="6" y1="6" x2="18" y2="18"></line></svg>
                </button>

                <!-- Capture Button (Hidden in Live Mode) -->
                <button x-show="!liveMode" @click="capturePhoto" class="w-20 h-20 rounded-full border-4 border-white flex items-center justify-center relative group">
                    <div class="w-16 h-16 bg-white rounded-full transition-transform group-active:scale-90"></div>
                </button>

                <!-- Live Indicator (Visible in Live Mode) -->
                <div x-show="liveMode" class="w-20 h-20 flex items-center justify-center">
                    <div class="relative w-full h-full flex items-center justify-center">
                        <div class="absolute inset-0 bg-gradient-to-tr from-blue-500 to-purple-500 rounded-full animate-spin blur-md opacity-70"></div>
                        <div class="relative bg-gray-900 rounded-full w-16 h-16 flex items-center justify-center border border-gray-700">
                             <svg xmlns="http://www.w3.org/2000/svg" width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="text-white"><path d="M12 2a3 3 0 0 0-3 3v7a3 3 0 0 0 6 0V5a3 3 0 0 0-3-3Z"></path><path d="M19 10v2a7 7 0 0 1-14 0v-2"></path><line x1="12" y1="19" x2="12" y2="22"></line><line x1="8" y1="22" x2="16" y2="22"></line></svg>
                        </div>
                    </div>
                </div>

                <button @click="switchCamera" class="text-white p-4 rounded-full bg-gray-800 hover:bg-gray-700 transition">
                    <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M20 10c0 6-8 12-8 12s-8-6-8-12a8 8 0 0 1 16 0Z"></path><circle cx="12" cy="10" r="3"></circle><path d="M12 2a8 8 0 0 1 7.9 7.4"></path></svg>
                </button>
            </div>
        </div>
    </div>

    <!-- GitHub Modal -->
    <div x-show="openGitHub" style="display: none;" class="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm"
        x-transition:enter="transition ease-out duration-300"
        x-transition:enter-start="opacity-0 scale-95"
        x-transition:enter-end="opacity-100 scale-100"
        x-transition:leave="transition ease-in duration-200"
        x-transition:leave-start="opacity-100 scale-100"
        x-transition:leave-end="opacity-0 scale-95">

        <div class="bg-gray-900 border border-gray-700 rounded-2xl w-full max-w-lg p-6 shadow-2xl relative overflow-hidden flex flex-col max-h-[90vh]" @click.outside="openGitHub = false">
            <h2 class="text-2xl font-bold mb-6 flex items-center gap-2">
                <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M9 19c-5 1.5-5-2.5-7-3m14 6v-3.87a3.37 3.37 0 0 0-.94-2.61c3.14-.35 6.44-1.54 6.44-7A5.44 5.44 0 0 0 20 4.77 5.07 5.07 0 0 0 19.91 1S18.73.65 16 2.48a13.38 13.38 0 0 0-7 0C6.27.65 5.09 1 5.09 1A5.07 5.07 0 0 0 5 4.77a5.44 5.44 0 0 0-1.5 3.78c0 5.42 3.3 6.61 6.44 7A3.37 3.37 0 0 0 9 18.13V22"></path></svg>
                GitHub Connect
            </h2>

            <div x-show="!githubConfigured" class="space-y-4">
                <div>
                    <label class="block text-sm font-medium text-gray-300 mb-1">GitHub Username</label>
                    <input type="text" x-model="githubUsername" class="w-full bg-gray-800 text-white rounded-xl px-4 py-3 border border-gray-700 focus:outline-none focus:border-indigo-500">
                </div>
                <div>
                    <label class="block text-sm font-medium text-gray-300 mb-1">Personal Access Token</label>
                    <input type="password" x-model="githubToken" class="w-full bg-gray-800 text-white rounded-xl px-4 py-3 border border-gray-700 focus:outline-none focus:border-indigo-500">
                    <p class="text-[10px] text-gray-500 mt-1">Token needs 'repo' scope.</p>
                </div>
                <button @click="saveGithubConfig" class="w-full bg-indigo-600 hover:bg-indigo-500 text-white py-3 rounded-xl font-bold transition">Connect Account</button>
            </div>

            <div x-show="githubConfigured" class="flex flex-col h-full overflow-hidden">
                <div class="flex justify-between items-center mb-4">
                    <span class="text-sm text-gray-400">Connected as <strong x-text="githubUsername" class="text-white"></strong></span>
                    <button @click="disconnectGithub" class="text-xs text-red-400 hover:text-red-300">Disconnect</button>
                </div>

                <div class="mb-4">
                    <button @click="fetchRepos" class="w-full bg-gray-800 hover:bg-gray-700 text-white py-2 rounded-lg text-sm border border-gray-600 transition flex items-center justify-center gap-2">
                        <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><polyline points="23 4 23 10 17 10"></polyline><polyline points="1 20 1 14 7 14"></polyline><path d="M3.51 9a9 9 0 0 1 14.85-3.36L23 10M1 14l4.64 4.36A9 9 0 0 0 20.49 15"></path></svg>
                        Refresh Repositories
                    </button>
                </div>

                <div class="flex-1 overflow-y-auto border border-gray-700 rounded-xl bg-gray-800/50 p-2 mb-4 space-y-1">
                    <template x-for="repo in repos" :key="repo.name">
                        <button @click="selectedRepo = repo.full_name"
                            :class="selectedRepo === repo.full_name ? 'bg-indigo-600 text-white' : 'text-gray-300 hover:bg-gray-700'"
                            class="w-full text-left px-3 py-2 rounded-lg text-sm transition truncate flex items-center gap-2">
                            <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"></path><polyline points="9 22 9 12 15 12 15 22"></polyline></svg>
                            <span x-text="repo.full_name"></span>
                        </button>
                    </template>
                    <div x-show="repos.length === 0" class="text-center py-8 text-gray-500 text-xs">No repositories found.</div>
                </div>

                <button @click="analyzeRepo" :disabled="!selectedRepo || isAnalyzing"
                    class="w-full bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-500 hover:to-purple-500 text-white py-3 rounded-xl font-bold transition shadow-lg disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2">
                    <span x-show="!isAnalyzing">Analyze Repository</span>
                    <span x-show="isAnalyzing" class="animate-pulse">Analyzing...</span>
                </button>
            </div>

            <button @click="openGitHub = false" class="absolute top-4 right-4 text-gray-500 hover:text-white">
                <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><line x1="18" y1="6" x2="6" y2="18"></line><line x1="6" y1="6" x2="18" y2="18"></line></svg>
            </button>
        </div>
    </div>

    <!-- Settings Modal -->
    <div x-show="openSettings" style="display: none;" class="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm"
        x-transition:enter="transition ease-out duration-300"
        x-transition:enter-start="opacity-0 scale-95"
        x-transition:enter-end="opacity-100 scale-100"
        x-transition:leave="transition ease-in duration-200"
        x-transition:leave-start="opacity-100 scale-100"
        x-transition:leave-end="opacity-0 scale-95">

        <div class="bg-gray-900 border border-gray-700 rounded-2xl w-full max-w-md p-6 shadow-2xl relative overflow-hidden" @click.outside="openSettings = false">
            <div class="absolute -top-10 -right-10 w-40 h-40 bg-indigo-500/10 rounded-full blur-3xl pointer-events-none"></div>

            <h2 class="text-2xl font-bold mb-6 bg-clip-text text-transparent bg-gradient-to-r from-blue-400 to-purple-500">Configuration</h2>

            <div class="mb-6">
                <label class="block text-sm font-medium text-gray-300 mb-2">Google Gemini API Key</label>
                <div class="relative">
                    <input type="password" x-model="apiKeyInput" placeholder="Enter your API Key"
                        class="w-full bg-gray-800 text-white rounded-xl px-4 py-3 border border-gray-700 focus:outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 transition-colors">
                </div>
                <p class="text-xs text-gray-500 mt-3 flex items-center gap-1">
                    <svg xmlns="http://www.w3.org/2000/svg" width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"></path><polyline points="7 10 12 15 17 10"></polyline><line x1="12" y1="15" x2="12" y2="3"></line></svg>
                    Stored securely in your R2 bucket (vpsai).
                </p>
            </div>

            <div class="flex justify-end gap-3 mt-8">
                <button @click="openSettings = false" class="px-5 py-2.5 rounded-xl text-gray-400 hover:text-white hover:bg-gray-800 transition font-medium">Close</button>
                <button @click="saveApiKey" class="px-5 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white transition shadow-lg shadow-indigo-500/20 font-medium transform hover:translate-y-px">Save Configuration</button>
            </div>
        </div>
    </div>

    <!-- Preview Modal -->
    <div x-show="previewOpen" style="display: none;" class="fixed inset-0 z-50 flex items-center justify-center bg-black/90 backdrop-blur-md"
        x-transition:enter="transition ease-out duration-300"
        x-transition:enter-start="opacity-0 scale-95"
        x-transition:enter-end="opacity-100 scale-100"
        x-transition:leave="transition ease-in duration-200"
        x-transition:leave-start="opacity-100 scale-100"
        x-transition:leave-end="opacity-0 scale-95">

        <div class="bg-gray-900 border border-gray-700 rounded-2xl w-[95%] h-[90%] flex flex-col shadow-2xl relative overflow-hidden" @click.outside="previewOpen = false">
             <!-- Header -->
             <div class="h-12 border-b border-gray-700 bg-gray-800 flex items-center justify-between px-4">
                 <h3 class="text-sm font-bold text-gray-300">HTML Preview</h3>
                 <button @click="previewOpen = false" class="p-1 rounded hover:bg-gray-700 text-gray-400 hover:text-white">
                    <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><line x1="18" y1="6" x2="6" y2="18"></line><line x1="6" y1="6" x2="18" y2="18"></line></svg>
                 </button>
             </div>
             <!-- Content -->
             <div class="flex-1 bg-white">
                 <iframe id="preview-frame" class="w-full h-full border-0"></iframe>
             </div>
        </div>
    </div>

    <script>
        // --- Marked & Highlight.js Configuration ---
        const renderer = new marked.Renderer();
        renderer.code = function(codeOrToken, lang) {
            let code = codeOrToken;
            let language = lang;

            // Handle new marked.js signature (v12+)
            if (typeof codeOrToken === 'object' && codeOrToken !== null && codeOrToken.text !== undefined) {
                code = codeOrToken.text;
                language = codeOrToken.lang;
            }

            const validLang = !!(language && hljs.getLanguage(language));
            code = String(code);
            const highlighted = validLang ? hljs.highlight(code, { language }).value : hljs.highlightAuto(code).value;
            const langDisplay = (language || 'text').toUpperCase();
            const encodedCode = encodeURIComponent(code).replace(/'/g, '%27');

            let previewBtn = '';
            if (language === 'html' || language === 'xml' || language === 'svg') {
                previewBtn = \`<button onclick="triggerPreview('\${encodedCode}')" class="flex items-center gap-1 text-[10px] bg-indigo-600 hover:bg-indigo-500 text-white px-2 py-1 rounded transition ml-2 font-semibold tracking-wide shadow-indigo-500/20 shadow-lg">
                    <svg xmlns="http://www.w3.org/2000/svg" width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"></path><circle cx="12" cy="12" r="3"></circle></svg>
                    REVIEW
                </button>\`;
            }

            return \`
            <div class="my-4 rounded-lg overflow-hidden border border-gray-700 bg-[#282c34] shadow-md group/code">
                <div class="flex items-center justify-between px-3 py-1.5 bg-[#21252b] border-b border-gray-700 select-none">
                    <div class="flex items-center gap-2">
                        <div class="flex gap-1">
                            <div class="w-2.5 h-2.5 rounded-full bg-red-500/50"></div>
                            <div class="w-2.5 h-2.5 rounded-full bg-yellow-500/50"></div>
                            <div class="w-2.5 h-2.5 rounded-full bg-green-500/50"></div>
                        </div>
                        <span class="text-[10px] font-mono text-gray-500 ml-2">\${langDisplay}</span>
                    </div>
                    <div class="flex items-center">
                        <button onclick="copyToClip('\${encodedCode}')" class="text-[10px] text-gray-400 hover:text-white transition flex items-center gap-1 px-2 py-1 rounded hover:bg-white/5">
                            <svg xmlns="http://www.w3.org/2000/svg" width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><rect x="9" y="9" width="13" height="13" rx="2" ry="2"></rect><path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1"></path></svg>
                            Copy
                        </button>
                        \${previewBtn}
                    </div>
                </div>
                <div class="p-4 overflow-x-auto">
                    <code class="hljs \${language} !bg-transparent !p-0 text-sm font-mono leading-relaxed">\${highlighted}</code>
                </div>
            </div>
            \`;
        };
        marked.setOptions({ renderer: renderer });

        window.triggerPreview = (encodedCode) => {
            const code = decodeURIComponent(encodedCode);
            window.dispatchEvent(new CustomEvent('preview-request', { detail: code }));
        };

        window.copyToClip = (encodedCode) => {
            const text = decodeURIComponent(encodedCode);
            navigator.clipboard.writeText(text);
        };

        function app() {
            return {
                sidebarOpen: false,
                openSettings: false,
                openGitHub: false,
                previewOpen: false,
                cameraOpen: false,
                userInput: '',
                apiKeyInput: '',
                messages: [],
                isLoading: false,
                sessions: [],
                currentSessionId: null,
                selectedImage: null,
                imageFile: null,
                stream: null,
                facingMode: 'environment',
                liveMode: false,
                liveInterval: null,
                liveText: '',
                isSpeaking: false,

                // GitHub State
                githubConfigured: false,
                githubUsername: '',
                githubToken: '',
                repos: [],
                selectedRepo: null,
                isAnalyzing: false,

                async init() {
                    try {
                        const res = await fetch('/api/key');
                        const data = await res.json();
                        if (!data.hasKey) {
                            setTimeout(() => { this.openSettings = true; }, 500);
                        } else {
                            this.apiKeyInput = '********************';
                        }
                    } catch (e) {
                        console.error("Failed to check key status", e);
                    }

                    try {
                        const ghRes = await fetch('/api/github/config');
                        const ghData = await ghRes.json();
                        if (ghData.hasConfig) {
                            this.githubConfigured = true;
                            // Optionally fetch username if we had an endpoint for it,
                            // or just wait for user to hit refresh
                        }
                    } catch(e) {}

                    this.loadHistory();
                },

                async loadHistory() {
                    try {
                        const res = await fetch('/api/history');
                        const data = await res.json();
                        this.sessions = data.history || [];
                    } catch(e) {
                        console.error("Failed to load history", e);
                    }
                },

                async loadSession(id) {
                    this.isLoading = true;
                    this.currentSessionId = id;
                    this.sidebarOpen = false;
                    this.messages = [];
                    try {
                        const res = await fetch('/api/history/' + id);
                        const data = await res.json();
                        this.messages = data.messages || [];
                        this.$nextTick(() => {
                             const chatContainer = document.getElementById('chat-container');
                             if (chatContainer) chatContainer.scrollTop = chatContainer.scrollHeight;
                        });
                    } catch(e) {
                        console.error("Failed to load session", e);
                    } finally {
                        this.isLoading = false;
                    }
                },

                async deleteSession(id) {
                    if (!confirm('Are you sure you want to delete this chat?')) return;

                    try {
                        const res = await fetch('/api/history/' + id, { method: 'DELETE' });
                        if (res.ok) {
                            this.sessions = this.sessions.filter(s => s.id !== id);
                            if (this.currentSessionId === id) {
                                this.newChat();
                            }
                        } else {
                            alert("Failed to delete chat.");
                        }
                    } catch (e) {
                        console.error("Failed to delete", e);
                    }
                },

                newChat() {
                    this.currentSessionId = null;
                    this.messages = [];
                    this.sidebarOpen = false;
                    this.clearImage();
                },

                handleFileUpload(event) {
                    const file = event.target.files[0];
                    if (!file) return;

                    this.imageFile = file;
                    const reader = new FileReader();
                    reader.onload = (e) => {
                        this.selectedImage = e.target.result;
                    };
                    reader.readAsDataURL(file);
                },

                clearImage() {
                    this.selectedImage = null;
                    this.imageFile = null;
                    if (this.$refs.fileInput) this.$refs.fileInput.value = '';
                },

                async startCamera() {
                    this.cameraOpen = true;
                    try {
                        this.stream = await navigator.mediaDevices.getUserMedia({
                            video: { facingMode: this.facingMode }
                        });
                        this.$refs.videoPreview.srcObject = this.stream;
                    } catch (err) {
                        console.error("Camera Error:", err);
                        alert("Could not access camera. Please check permissions.");
                        this.stopCamera();
                    }
                },

                stopCamera() {
                    this.cameraOpen = false;
                    this.stopLiveAnalysis(); // Ensure live mode stops
                    if (this.stream) {
                        this.stream.getTracks().forEach(track => track.stop());
                        this.stream = null;
                    }
                },

                async switchCamera() {
                    this.stopCamera(); // Stop current stream first
                    this.facingMode = this.facingMode === 'user' ? 'environment' : 'user';
                    // Need a small delay or the browser might complain about resource in use
                    setTimeout(() => {
                         if(this.cameraOpen) this.startCamera();
                    }, 200);
                },

                capturePhoto() {
                    if (!this.stream) return;

                    const video = this.$refs.videoPreview;
                    const canvas = this.$refs.canvasCapture;
                    const context = canvas.getContext('2d');

                    canvas.width = video.videoWidth;
                    canvas.height = video.videoHeight;

                    context.drawImage(video, 0, 0, canvas.width, canvas.height);

                    // Convert to base64
                    const dataUrl = canvas.toDataURL('image/jpeg');

                    // Create a pseudo File object for consistency
                    fetch(dataUrl)
                        .then(res => res.blob())
                        .then(blob => {
                            const file = new File([blob], "camera_capture.jpg", { type: "image/jpeg" });
                            this.imageFile = file;
                            this.selectedImage = dataUrl;
                            this.stopCamera();
                        });
                },

                toggleLiveMode() {
                    this.liveMode = !this.liveMode;
                    if (this.liveMode) {
                        this.startLiveAnalysis();
                    } else {
                        this.stopLiveAnalysis();
                    }
                },

                startLiveAnalysis() {
                    this.liveText = "Analyzing...";
                    this.liveInterval = setInterval(async () => {
                        if (!this.cameraOpen || !this.liveMode) return;

                        // Capture frame silently
                        const video = this.$refs.videoPreview;
                        const canvas = this.$refs.canvasCapture;
                        const context = canvas.getContext('2d');
                        if (!video.videoWidth) return;

                        canvas.width = video.videoWidth;
                        canvas.height = video.videoHeight;
                        context.drawImage(video, 0, 0, canvas.width, canvas.height);
                        const base64Data = canvas.toDataURL('image/jpeg').split(',')[1];
                        const mimeType = 'image/jpeg';

                        // Send to AI
                        try {
                            const res = await fetch('/api/chat', {
                                method: 'POST',
                                headers: { 'Content-Type': 'application/json' },
                                body: JSON.stringify({
                                    message: "Describe what is in this image briefly in one sentence.",
                                    image: { mimeType: mimeType, data: base64Data },
                                    model: 'gemini-3-flash-preview',
                                    saveHistory: false
                                })
                            });
                            const data = await res.json();
                            if (data.response) {
                                this.liveText = data.response;
                                this.speak(data.response);
                            }
                        } catch (e) {
                            console.error("Live Analysis Error", e);
                        }

                    }, 4000); // Every 4 seconds
                },

                stopLiveAnalysis() {
                    this.liveMode = false;
                    this.liveText = '';
                    if (this.liveInterval) {
                        clearInterval(this.liveInterval);
                        this.liveInterval = null;
                    }
                    window.speechSynthesis.cancel();
                },

                speak(text) {
                    if (!window.speechSynthesis) return;
                    window.speechSynthesis.cancel(); // Stop previous
                    const utterance = new SpeechSynthesisUtterance(text);
                    // Select a voice if available
                    const voices = window.speechSynthesis.getVoices();
                    // Try to find a good English voice
                    const voice = voices.find(v => v.lang.includes('en') && v.name.includes('Google')) || voices[0];
                    if (voice) utterance.voice = voice;

                    utterance.rate = 1.1;
                    utterance.pitch = 1.0;
                    window.speechSynthesis.speak(utterance);
                },

                openPreviewModal(code) {
                    this.previewOpen = true;
                    this.$nextTick(() => {
                        const frame = document.getElementById('preview-frame');
                        const doc = frame.contentWindow.document;
                        doc.open();
                        doc.write(code);
                        doc.close();
                    });
                },

                async saveApiKey() {
                    if (!this.apiKeyInput.trim()) return;
                    try {
                        const res = await fetch('/api/key', {
                            method: 'PUT',
                            headers: { 'Content-Type': 'application/json' },
                            body: JSON.stringify({ apiKey: this.apiKeyInput })
                        });
                        if (res.ok) {
                            this.openSettings = false;
                            this.apiKeyInput = '********************';
                        } else {
                            alert('Failed to save API Key.');
                        }
                    } catch (e) {
                        alert('Error saving API Key.');
                    }
                },

                async saveGithubConfig() {
                    if (!this.githubUsername || !this.githubToken) return;
                    try {
                        const res = await fetch('/api/github/config', {
                            method: 'PUT',
                            headers: { 'Content-Type': 'application/json' },
                            body: JSON.stringify({ username: this.githubUsername, token: this.githubToken })
                        });
                        if (res.ok) {
                            this.githubConfigured = true;
                            this.fetchRepos();
                        } else {
                            alert('Failed to save GitHub config');
                        }
                    } catch (e) { alert('Error saving GitHub config'); }
                },

                async fetchRepos() {
                    try {
                        const res = await fetch('/api/github/repos');
                        const data = await res.json();
                        if (data.repos) {
                            this.repos = data.repos;
                        }
                    } catch (e) { alert('Failed to fetch repos'); }
                },

                async analyzeRepo() {
                    if (!this.selectedRepo) return;
                    this.isAnalyzing = true;
                    this.openGitHub = false; // Close modal to show chat

                    // Add user message
                    this.messages.push({ role: 'user', content: 'Analyze the repository: ' + this.selectedRepo });
                    this.messages.push({ role: 'model', content: 'Connecting to GitHub and analyzing repository content. This may take a moment...' });

                    try {
                        const res = await fetch('/api/github/analyze', {
                            method: 'POST',
                            headers: { 'Content-Type': 'application/json' },
                            body: JSON.stringify({
                                repoName: this.selectedRepo,
                                sessionId: this.currentSessionId
                            })
                        });
                        const data = await res.json();

                        // Remove the "loading" message or update it
                        this.messages.pop(); // Remove placeholder

                        if (data.error) {
                            this.messages.push({ role: 'model', content: "Error Analyzing Repo: " + data.error });
                        } else {
                            this.messages.push({ role: 'model', content: data.response });
                            if (data.sessionId) {
                                this.currentSessionId = data.sessionId;
                                this.loadHistory();
                            }
                        }
                    } catch (e) {
                        this.messages.push({ role: 'model', content: "Network Error during analysis." });
                    } finally {
                        this.isAnalyzing = false;
                        this.$nextTick(() => {
                             const chatContainer = document.getElementById('chat-container');
                             if (chatContainer) chatContainer.scrollTop = chatContainer.scrollHeight;
                        });
                    }
                },

                disconnectGithub() {
                    this.githubConfigured = false;
                    this.githubToken = '';
                    this.repos = [];
                    // In a real app we might delete from backend too, but for now just UI reset allows re-entry
                },

                async createPR(proposal, msgIndex) {
                    // msgIndex is the index of the message in the array
                    const msg = this.messages[msgIndex];
                    if (msg.prCreated) return;

                    // Temporarily set a loading state on the button
                    // But Alpine reactivity might be tricky with deep object properties unless we replace the object
                    // We'll use a local trick or just trust the network speed.
                    // Let's add a "creating..." text change via button text binding in HTML?
                    // Actually, let's just use a global flag or modify the message object.

                    try {
                         const res = await fetch('/api/github/pr', {
                            method: 'POST',
                            headers: { 'Content-Type': 'application/json' },
                            body: JSON.stringify(proposal)
                        });
                        const data = await res.json();

                        if (data.error) {
                            alert("Error creating PR: " + data.error);
                        } else {
                             // Update the message state to show "PR Created"
                             this.messages[msgIndex].prCreated = true;
                             this.messages[msgIndex].prUrl = data.prUrl;
                             // Force reactivity
                             this.messages = [...this.messages];
                        }
                    } catch(e) {
                        alert("Network error creating PR");
                    }
                },

                async sendMessage() {
                    const text = this.userInput.trim();
                    if (!text && !this.selectedImage) return;

                    const userMsg = { role: 'user', content: text };
                    let imagePayload = null;

                    if (this.selectedImage && this.imageFile) {
                        // Extract base64 data (remove prefix)
                        const base64Data = this.selectedImage.split(',')[1];
                        imagePayload = {
                            mimeType: this.imageFile.type,
                            data: base64Data
                        };
                        userMsg.image = imagePayload;
                    }

                    this.messages.push(userMsg);

                    // Clear inputs immediately
                    this.userInput = '';
                    this.clearImage();
                    this.isLoading = true;

                    const contextMessages = this.messages.slice(0, -1);

                    this.$nextTick(() => {
                        const chatContainer = document.getElementById('chat-container');
                        if (chatContainer) chatContainer.scrollTop = chatContainer.scrollHeight;
                    });

                    try {
                        const res = await fetch('/api/chat', {
                            method: 'POST',
                            headers: { 'Content-Type': 'application/json' },
                            body: JSON.stringify({
                                message: text,
                                image: imagePayload,
                                model: 'gemini-3-flash-preview',
                                sessionId: this.currentSessionId,
                                history: contextMessages
                            })
                        });

                        const data = await res.json();

                        if (data.error) {
                            this.messages.push({ role: 'model', content: "Error: " + data.error });
                             if (res.status === 401) {
                                this.openSettings = true;
                            }
                        } else {
                            // Check for JSON action
                            let finalContent = data.response;
                            let prProposal = null;

                             try {
                                // Try to extract JSON block if it's wrapped in markdown
                                let jsonStr = finalContent;
                                const jsonBlock = finalContent.match(/\`\`\`(?:json)?\\s*([\\s\\S]*?)\\s*\`\`\`/);
                                if (jsonBlock) {
                                    jsonStr = jsonBlock[1];
                                }

                                // Clean up any non-json prefix/suffix if regex failed
                                const start = jsonStr.indexOf('{');
                                const end = jsonStr.lastIndexOf('}');
                                if (start >= 0 && end > start) {
                                    jsonStr = jsonStr.substring(start, end + 1);
                                    const parsed = JSON.parse(jsonStr);

                                    if (parsed.action === 'github_pr') {
                                        prProposal = parsed.action_input;
                                        // Clean up display text
                                        finalContent = finalContent.replace(/\`\`\`(?:json)?\\s*[\\s\\S]*?\\s*\`\`\`/g, '').trim();
                                        if (!finalContent) finalContent = "I've prepared a fix for you. Please review the proposed changes below.";
                                    }
                                } else {
                                    // Try raw parsing if no markdown blocks
                                    const parsed = JSON.parse(jsonStr);
                                     if (parsed && parsed.action === 'github_pr') {
                                        prProposal = parsed.action_input;
                                        finalContent = "I've prepared a fix for you. Please review the proposed changes below.";
                                    }
                                }
                            } catch (e) {
                                // console.log("No valid action found", e);
                            }

                            const modelMsg = { role: 'model', content: finalContent };
                            if (data.generatedImage) {
                                modelMsg.image = data.generatedImage;
                            }
                            if (prProposal) {
                                modelMsg.prProposal = prProposal;
                            }

                            this.messages.push(modelMsg);

                            if (data.sessionId && this.currentSessionId !== data.sessionId) {
                                this.currentSessionId = data.sessionId;
                                this.loadHistory();
                            }
                        }
                    } catch (e) {
                        this.messages.push({ role: 'model', content: "Network Error: " + e.message });
                    } finally {
                        this.isLoading = false;
                        this.$nextTick(() => {
                            const chatContainer = document.getElementById('chat-container');
                            if (chatContainer) chatContainer.scrollTop = chatContainer.scrollHeight;
                        });
                    }
                },

                parseMarkdown(text) {
                    if (typeof text !== 'string') return '';
                    return marked.parse(text);
                },

                copyToClipboard(text) {
                    navigator.clipboard.writeText(text);
                }
            }
        }
    </script>
</body>
</html>
`
