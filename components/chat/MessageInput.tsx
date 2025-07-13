'use client';

import * as React from "react"
import { ArrowUp } from "lucide-react"
import { Button } from "../ui/button"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "../ui/dropdown-menu"
import { Textarea } from "../ui/textarea"
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "../ui/tooltip"
import { Badge } from "../ui/badge"
import Image from "next/image"
import { useSearchProvider } from "../../contexts/SearchProviderContext"
import { cn } from "../../lib/utils"

const models = [
  {
    id: "gemini-flash",
    name: "Gemini Flash",
    description: "Fast and efficient responses",
    section: "recommended",
  },
  {
    id: "gemini-pro",
    name: "Gemini Pro",
    description: "Advanced reasoning capabilities",
    section: "general",
  },
  {
    id: "gpt-4o-mini",
    name: "GPT-4o Mini",
    description: "OpenAI's efficient model",
    section: "general",
  },
  {
    id: "gpt-4o",
    name: "GPT-4o",
    description: "OpenAI's advanced model",
    section: "general",
  },
]

const searchEngines = [
  {
    id: "brave",
    name: "Brave",
    description: "Privacy-focused search engine",
    section: "default",
  },
  {
    id: "searxng",
    name: "SearXNG",
    description: "Open-source metasearch engine",
    section: "search",
  },
  {
    id: "exa",
    name: "Exa",
    description: "AI-powered semantic search",
    section: "search",
  },
]

interface MessageInputProps {
  onSendMessage: (message: string, options?: { model?: string; searchProvider?: string }) => void;
  isLoading: boolean;
  placeholder?: string;
  variant?: 'default' | 'floating';
}

export default function MessageInput({ 
  onSendMessage, 
  isLoading, 
  placeholder = "What do you want to know?",
  variant = "default"
}: MessageInputProps) {
  const { searchProvider, setSearchProvider } = useSearchProvider()
  const [selectedModel, setSelectedModel] = React.useState(models[0])
  const [input, setInput] = React.useState("")
  const textareaRef = React.useRef<HTMLTextAreaElement>(null)

  const handleInputChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    setInput(e.target.value)
  }

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (input.trim() && !isLoading) {
      onSendMessage(input.trim(), {
        model: selectedModel.id,
        searchProvider: searchProvider,
      });
      setInput('');
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey && !isLoading) {
      e.preventDefault();
      handleSubmit(e);
    }
  };

  React.useEffect(() => {
    if (textareaRef.current) {
      textareaRef.current.style.height = "auto"
      textareaRef.current.style.height = `${textareaRef.current.scrollHeight}px`
    }
  }, [input])

  const selectedEngineName = React.useMemo(() => {
    return searchEngines.find((engine) => engine.id === searchProvider)?.name
  }, [searchProvider])

  const groupedModels = React.useMemo(() => {
    const groups: Record<string, typeof models> = {}
    models.forEach((model) => {
      if (!groups[model.section]) {
        groups[model.section] = []
      }
      groups[model.section].push(model)
    })
    return groups
  }, [])

  const containerClass = variant === 'floating' 
    ? "p-3" 
    : "p-6 flex justify-center";
    
  const inputContainerClass = variant === 'floating'
    ? "border border-gray-200 rounded-xl shadow-sm overflow-hidden w-[800px] min-h-[80px] flex flex-col transition-all duration-200 hover:border-gray-300 focus-within:border-gray-400 focus-within:shadow-md"
    : "border border-gray-200 rounded-xl shadow-sm overflow-hidden w-[800px] min-h-[80px] flex flex-col transition-all duration-200 hover:border-gray-300 focus-within:border-gray-400 focus-within:shadow-md";
  
  const inputContainerStyle = { backgroundColor: '#fefefb' };
    
  const textareaClass = variant === 'floating'
    ? "w-full border-0 resize-none focus-visible:ring-0 focus-visible:outline-none shadow-none bg-transparent disabled:opacity-50 text-base leading-6 placeholder:text-gray-500 placeholder:font-medium placeholder:text-left"
    : "w-full border-0 resize-none focus-visible:ring-0 focus-visible:outline-none shadow-none bg-transparent disabled:opacity-50 text-base leading-6 placeholder:text-gray-500 placeholder:font-medium placeholder:text-left";

  return (
    <div className={containerClass}>
      <form onSubmit={handleSubmit} className="relative w-full">
        <div className={inputContainerClass} style={inputContainerStyle}>
          {/* Text Input Area - Takes most space */}
          <div className="flex-1">
            <Textarea
              ref={textareaRef}
              value={input}
              onChange={handleInputChange}
              onKeyDown={handleKeyDown}
              placeholder={placeholder}
              className={cn(textareaClass, "h-full rounded-none p-4")}
              disabled={isLoading}
              rows={1}
              style={{ minHeight: '50px', maxHeight: '150px', textAlign: 'left' }}
            />
          </div>

          {/* Bottom Controls Row */}
          <div className="flex justify-between items-center px-4 pb-3">
            {/* Left Side Controls - Model and Search Engine */}
            <div className="flex items-center gap-1">
              {/* Model Selection Icon */}
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="ghost" size={variant === 'floating' ? 'sm' : 'icon'} className="rounded-lg">
                    <svg 
                      xmlns="http://www.w3.org/2000/svg" 
                      width={variant === 'floating' ? 14 : 16} 
                      height={variant === 'floating' ? 14 : 16} 
                      viewBox="0 0 24 24" 
                      fill="none" 
                      stroke="currentColor" 
                      strokeWidth="1.8" 
                      strokeLinecap="round" 
                      strokeLinejoin="round"
                      className="opacity-60 transition-colors duration-300"
                    >
                      <path d="M5 5m0 1a1 1 0 0 1 1 -1h12a1 1 0 0 1 1 1v12a1 1 0 0 1 -1 1h-12a1 1 0 0 1 -1 -1z"></path>
                      <path d="M9 9h6v6h-6z"></path>
                      <path d="M3 10h2"></path>
                      <path d="M3 14h2"></path>
                      <path d="M10 3v2"></path>
                      <path d="M14 3v2"></path>
                      <path d="M21 10h-2"></path>
                      <path d="M21 14h-2"></path>
                      <path d="M14 21v-2"></path>
                      <path d="M10 21v-2"></path>
                    </svg>
                    <span className="sr-only">Select Model</span>
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="start" side="top" className="w-80">
                  {Object.entries(groupedModels).map(([section, sectionModels], sectionIndex) => (
                    <React.Fragment key={section}>
                      {sectionIndex > 0 && <DropdownMenuSeparator />}
                      {section === "general" && (
                        <div className="px-2 py-1.5 text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Models
                        </div>
                      )}
                      {sectionModels.map((model) => (
                        <DropdownMenuItem
                          key={model.id}
                          onSelect={() => setSelectedModel(model)}
                          className="flex flex-col items-start gap-1 p-3"
                        >
                          <div className="flex items-center gap-2 w-full">
                            <span className="font-medium">{model.name}</span>
                            {selectedModel.id === model.id && (
                              <Badge
                                variant="secondary"
                                className="text-xs bg-blue-100 text-blue-700 dark:bg-blue-900 dark:text-blue-300"
                              >
                                selected
                              </Badge>
                            )}
                          </div>
                          <span className="text-sm text-gray-500">{model.description}</span>
                        </DropdownMenuItem>
                      ))}
                    </React.Fragment>
                  ))}
                </DropdownMenuContent>
              </DropdownMenu>

              {/* Search Engine Selection */}
              <TooltipProvider>
                <Tooltip>
                  <DropdownMenu>
                    <TooltipTrigger asChild>
                      <DropdownMenuTrigger asChild>
                        <Button variant="ghost" size={variant === 'floating' ? 'sm' : 'icon'} className="rounded-lg">
                          <svg 
                            xmlns="http://www.w3.org/2000/svg" 
                            width={variant === 'floating' ? 14 : 16} 
                            height={variant === 'floating' ? 14 : 16} 
                            viewBox="0 0 24 24" 
                            fill="currentColor" 
                            fillRule="evenodd"
                            className="opacity-60 transition-colors duration-300"
                          >
                            <path d="M11 2.125a8.378 8.378 0 0 1 8.375 8.375c0 .767-.1 1.508-.304 2.22l-.029.085a.875.875 0 0 1-1.653-.566l.054-.206c.12-.486.182-.996.182-1.533A6.628 6.628 0 0 0 11 3.875 6.628 6.628 0 0 0 4.375 10.5a6.628 6.628 0 0 0 10.402 5.445c.943-.654 2.242-.664 3.153.109l.176.165.001.002 4.066 4.184a.875.875 0 0 1-1.256 1.22l-4.064-4.185-.104-.088c-.263-.183-.646-.197-.975.03l-.001.003A8.378 8.378 0 0 1 2.625 10.5 8.378 8.378 0 0 1 11 2.125Zm0 7.09a1.3 1.3 0 1 1 0 2.6 1.3 1.3 0 0 1 0-2.6Z"></path>
                          </svg>
                          <span className="sr-only">Select Search Engine</span>
                        </Button>
                      </DropdownMenuTrigger>
                    </TooltipTrigger>
                    <DropdownMenuContent align="start" side="top" className="w-80">
                      <div className="px-2 py-1.5 text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Search Engines
                      </div>
                      {searchEngines.map((engine) => (
                        <DropdownMenuItem
                          key={engine.id}
                          onSelect={() => setSearchProvider(engine.id as any)}
                          className="flex flex-col items-start gap-1 p-3"
                        >
                          <div className="flex items-center gap-2 w-full">
                            <span className="font-medium">{engine.name}</span>
                            {searchProvider === engine.id && (
                              <Badge
                                variant="secondary"
                                className="text-xs bg-blue-100 text-blue-700 dark:bg-blue-900 dark:text-blue-300"
                              >
                                selected
                              </Badge>
                            )}
                          </div>
                          <span className="text-sm text-gray-500">{engine.description}</span>
                        </DropdownMenuItem>
                      ))}
                    </DropdownMenuContent>
                  </DropdownMenu>
                  <TooltipContent>
                    <p>Search with: {selectedEngineName}</p>
                  </TooltipContent>
                </Tooltip>
              </TooltipProvider>
            </div>

            {/* Right Side Controls */}
            <div className="flex items-center">
              {/* Send Button */}
              <TooltipProvider>
                <Tooltip>
                  <TooltipTrigger asChild>
                    <Button 
                      type="submit"
                      size={variant === 'floating' ? 'sm' : 'icon'} 
                      variant="ghost" 
                      className={cn(
                        "rounded-lg transition-colors",
                        input.trim() && !isLoading 
                          ? "bg-[#0d9488] hover:bg-[#0f766e] text-white" 
                          : ""
                      )}
                      disabled={!input.trim() || isLoading}
                    >
                      <ArrowUp className={cn(
                        variant === 'floating' ? 'w-4 h-4' : 'w-5 h-5',
                        input.trim() && !isLoading ? "text-white" : ""
                      )} />
                      <span className="sr-only">Send</span>
                    </Button>
                  </TooltipTrigger>
                  <TooltipContent>
                    <p>Send</p>
                  </TooltipContent>
                </Tooltip>
              </TooltipProvider>
            </div>
          </div>
        </div>
      </form>
    </div>
  );
}