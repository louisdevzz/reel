import React, { useState } from "react";
import { createFileRoute } from "@tanstack/react-router";
import { ArrowRightFromLine, MessageSquareText } from "lucide-react";

export const Route = createFileRoute('/live/$username')({
    component: LiveDetailsPage,
})

function LiveDetailsPage() {
    const [isSidebarExpanded, setIsSidebarExpanded] = useState(true);

    const toggleSidebar = () => {
        setIsSidebarExpanded(!isSidebarExpanded);
    };

    return (
        <div className="relative flex h-screen overflow-hidden bg-[#18181b] text-white">
            <div className={`flex-1 ${isSidebarExpanded ? 'mr-[400px]' : 'mr-0'} h-[calc(100vh-4rem)] overflow-y-auto transition-all duration-300`}>
                <div className="flex flex-col flex-1">
                    <div className="relative bg-black overflow-hidden aspect-video w-full">
                        <label className="w-full h-full flex items-center justify-center text-3xl text-gray-400">[Stream Video]</label>
                        <span className="absolute top-4 left-4 bg-red-600 text-xs font-bold px-3 py-1 rounded-full">LIVE</span>
                        <div className="absolute top-4 right-4 bg-black/70 px-3 py-1 rounded-full text-sm flex items-center gap-2">
                            <span className="w-2 h-2 bg-green-400 rounded-full inline-block"></span>43,778 viewers
                        </div>
                    </div>
                    <div className="flex flex-col gap-4 px-6 pt-8 pb-4 bg-[#18181b]">
                        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
                            <div className="flex items-center gap-4">
                                <div className="relative">
                                    <img
                                        src="https://static-cdn.jtvnw.net/jtv_user_pictures/asmongold-profile_image-7b7b7b7b7b7b7b-70x70.png"
                                        alt="Streamer"
                                        className="w-16 h-16 rounded-full border-2 border-[#9147ff]"
                                    />
                                    <span className="absolute -bottom-1 left-1/2 -translate-x-1/2 bg-red-600 text-xs font-bold px-2 py-0.5 rounded-full">LIVE</span>
                                </div>
                                <div>
                                    <div className="flex items-center gap-2">
                                        <span className="font-bold text-xl">venruki</span>
                                        <span className="bg-[#9147ff] text-xs px-2 py-0.5 rounded-full font-semibold">✔</span>
                                    </div>
                                    <div className="text-gray-400 text-sm">363K followers</div>
                                    <div className="flex gap-2 mt-1">
                                        <span className="bg-[#27272a] text-[#a78bfa] px-2 py-0.5 rounded text-xs font-semibold">World of Warcraft</span>
                                        <span className="bg-[#27272a] text-gray-300 px-2 py-0.5 rounded text-xs">English</span>
                                    </div>
                                </div>
                            </div>
                            <div className="flex gap-2 flex-wrap items-center">
                                <button className="bg-[#9147ff] hover:bg-[#772ce8] px-5 py-2 rounded-full font-bold text-white text-sm">Follow</button>
                                <button className="bg-[#232327] hover:bg-[#18181b] px-5 py-2 rounded-full font-bold text-white text-sm border border-[#2f2f35]">Gift a Sub</button>
                                <button className="bg-[#232327] hover:bg-[#18181b] px-5 py-2 rounded-full font-bold text-white text-sm border border-[#2f2f35]">Subscribe</button>
                                <div className="flex items-center gap-1 ml-4 text-red-400 font-semibold">
                                    <svg width="20" height="20" fill="none" viewBox="0 0 24 24"><path fill="currentColor" d="M12 12a5 5 0 1 0 0-10 5 5 0 0 0 0 10Zm0 2c-3.33 0-10 1.67-10 5v3h20v-3c0-3.33-6.67-5-10-5Z"/></svg>
                                    672
                                </div>
                                <div className="ml-2 text-gray-400 text-xs">3:48:42</div>
                            </div>
                        </div>
                        <div className="font-semibold text-lg text-white">
                            GAMING + 2400 Challenges + BONUS MOG DROPS + NEW TRADING POST | Morning Coffee w/ Ven 🔥
                        </div>
                    </div>
                    <div className="px-6 pb-6">
                        <div className="mt-6 bg-[#232327] rounded-lg p-4">
                            <div className="flex items-center gap-2 mb-2">
                                <span className="font-bold text-lg">About venruki</span>
                                <span className="bg-[#9147ff] text-xs px-2 py-0.5 rounded-full font-semibold">✔</span>
                            </div>
                            <div className="text-gray-400 text-sm mb-2">
                                <span className="font-bold text-white">363K followers</span>
                                <span className="mx-2">·</span>
                                <span className="text-[#a78bfa] font-semibold">Mythic Talent</span>
                            </div>
                            <div className="text-gray-300 mb-3">
                                Streaming full time since 2013. Thank you all for your outrageous support over the years!
                            </div>
                            <div className="flex gap-4 text-gray-400">
                                <a href="https://youtube.com/Venruki" target="_blank" rel="noopener noreferrer" className="flex items-center gap-1 hover:text-white">
                                    <svg width="20" height="20" fill="currentColor" viewBox="0 0 24 24"><path d="M10 15l5.19-3L10 9v6zm12-3c0-5.52-4.48-10-10-10S2 6.48 2 12s4.48 10 10 10 10-4.48 10-10zm-2 0c0 4.42-3.58 8-8 8s-8-3.58-8-8 3.58-8 8-8 8 3.58 8 8z"/></svg>
                                    Youtube.com/Venruki
                                </a>
                                <a href="#" className="flex items-center gap-1 hover:text-white">
                                    <svg width="20" height="20" fill="currentColor" viewBox="0 0 24 24"><path d="M22.46 6c-.77.35-1.6.59-2.47.7a4.3 4.3 0 0 0 1.88-2.37 8.59 8.59 0 0 1-2.72 1.04A4.28 4.28 0 0 0 16.11 4c-2.37 0-4.29 1.92-4.29 4.29 0 .34.04.67.11.99C7.69 9.13 4.07 7.38 1.64 4.7c-.37.64-.58 1.38-.58 2.17 0 1.5.76 2.82 1.92 3.6a4.28 4.28 0 0 1-1.94-.54v.05c0 2.1 1.5 3.85 3.5 4.25-.36.1-.74.16-1.13.16-.28 0-.54-.03-.8-.08.54 1.7 2.1 2.94 3.95 2.97A8.6 8.6 0 0 1 2 19.54a12.13 12.13 0 0 0 6.56 1.92c7.88 0 12.2-6.53 12.2-12.2 0-.19 0-.37-.01-.56A8.7 8.7 0 0 0 24 4.59a8.5 8.5 0 0 1-2.54.7z"/></svg>
                                    Twitter
                                </a>
                                <a href="#" className="flex items-center gap-1 hover:text-white">
                                    <svg width="20" height="20" fill="currentColor" viewBox="0 0 24 24"><path d="M7.75 2h8.5A5.75 5.75 0 0 1 22 7.75v8.5A5.75 5.75 0 0 1 16.25 22h-8.5A5.75 5.75 0 0 1 2 16.25v-8.5A5.75 5.75 0 0 1 7.75 2zm0 1.5A4.25 4.25 0 0 0 3.5 7.75v8.5A4.25 4.25 0 0 0 7.75 20.5h8.5A4.25 4.25 0 0 0 20.5 16.25v-8.5A4.25 4.25 0 0 0 16.25 3.5h-8.5zm4.25 3.25a5.25 5.25 0 1 1 0 10.5 5.25 5.25 0 0 1 0-10.5zm0 1.5a3.75 3.75 0 1 0 0 7.5 3.75 3.75 0 0 0 0-7.5zm6.25.75a1.25 1.25 0 1 1-2.5 0 1.25 1.25 0 0 1 2.5 0z"/></svg>
                                    Instagram
                                </a>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
            
            
            <button
                onClick={toggleSidebar}
                className={`fixed right-0 top-1/2 transform -translate-y-1/2 z-50 bg-[#232327] border border-[#2f2f35] border-r-0 rounded-l-lg p-2 hover:bg-[#2f2f35] transition-all duration-300 ${isSidebarExpanded ? 'right-[400px]' : 'right-0'}`}
            >
                <ArrowRightFromLine 
                    className={`w-4 h-4 text-white transition-transform duration-300 ${!isSidebarExpanded ? 'rotate-180' : ''}`} 
                />
            </button>

            <div className={`fixed right-0 top-16 h-[calc(100vh-4rem)] flex flex-col bg-[#232327] border-l border-[#2f2f35] transition-all duration-300 ${isSidebarExpanded ? 'w-[400px] min-w-[320px] max-w-[420px]' : 'w-0 overflow-hidden'}`}>
                <div className="bg-[#18181b] px-4 py-2 border-b border-[#2f2f35] flex items-center text-sm font-semibold text-white/80">
                    <MessageSquareText className="w-4 h-4 mr-2" /> Stream Chat
                </div>
                <div className="flex-1 overflow-y-auto p-4 space-y-2">
                    <ChatMessage user="ailurovt" text="ABOBA Mista Beasto" />
                    <ChatMessage user="Triams_" text="oh a reaction channel to reactions, hell yeah" />
                    <ChatMessage user="ecchigun_" text="soft canceled" />
                    <ChatMessage user="ogipk" text="So its now right-wing to disagree with sexual harassment and alcohol abuse? Gotcha" />
                    <ChatMessage user="AurangeJuice" text="It's almost like someone who is a controversy vulture probably isn't that honest of a person to begin with" />
                    <ChatMessage user="Gaouchi" text="the Hasan link is BS and the only reason for this post.. the machine is pushing him rn" />
                    <ChatMessage user="bootcute29" text={<span className="text-[#9147ff]">💜</span>} />
                    <ChatMessage user="odin1997" text="criticism = ***** /right wing lol, people are so stupid" />
                </div>
                <div className="p-4 border-t border-[#2f2f35]">
                    <div className="mb-2 text-xs text-gray-400">Verified Accounts Only Chat</div>
                    <div className="flex gap-2">
                        <input className="flex-1 rounded bg-[#18181b] border border-[#2f2f35] px-3 py-2 text-sm text-white focus:outline-none" placeholder="Send a message" disabled />
                        <button className="bg-[#9147ff] px-4 py-2 rounded text-white font-bold opacity-60 cursor-not-allowed">Chat</button>
                    </div>
                </div>
            </div>
        </div>
    );
}

function ChatMessage({ user, text }: { user: string; text: React.ReactNode }) {
    return (
        <div className="flex items-center gap-2 text-sm">
            <span className="font-bold text-[#9147ff]">{user}</span>
            <span>{text}</span>
        </div>
    );
}