"use client"
import React from 'react'
import {
    Sidebar,
    SidebarContent,
    SidebarFooter,
    SidebarGroup,
    SidebarHeader,
    SidebarMenu,
    SidebarMenuButton,
    SidebarMenuItem,
    SidebarProvider,
} from "@/components/ui/sidebar"
import Image from 'next/image'
import { Compass, GalleryHorizontalEnd, Search } from 'lucide-react'
import { usePathname } from 'next/navigation'


const MenuOptions = [
    {
        title: 'Home',
        icon: Search,
        path: '/#'
    },
    {
        title: 'Discover',
        icon: Compass,
        path: '/discover'
    },
    {
        title: 'Library',
        icon: GalleryHorizontalEnd,
        path: '/library'
    },

]
function AppSidebar() {
    const path = usePathname();
    return (
        <SidebarProvider>
            <Sidebar style={{backgroundColor: '#f3f3ed'}}>
                <SidebarHeader className='flex px-6 pt-3 pb-2' style={{backgroundColor: '#f3f3ed'}}>
                    <div className="w-[180px] h-[140px] relative">
                        <Image 
                            src={'/logo.png'} 
                            alt='logo' 
                            width={180} 
                            height={140}
                            priority
                            className="object-contain"
                            style={{ width: '180px', height: '140px' }}
                        />
                    </div>
                </SidebarHeader>
                <SidebarContent style={{backgroundColor: '#f3f3ed'}}>
                    <SidebarGroup >
                        <SidebarMenu className="space-y-6">
                            {MenuOptions.map((menu, index) => (
                                <SidebarMenuItem key={index}>
                                    <SidebarMenuButton asChild
                                        className={`p-5 py-6 hover:bg-transparent hover:font-bold
                                    ${path?.includes(menu.path) && 'font-bold'}`}>
                                        <a href={menu.path} className=''>
                                            <menu.icon className='h-8 w-8' />
                                            <span className='text-lg'>{menu.title}</span>
                                        </a>
                                    </SidebarMenuButton>
                                </SidebarMenuItem>
                            ))}
                        </SidebarMenu>
                    </SidebarGroup>
                </SidebarContent>
                <SidebarFooter style={{backgroundColor: '#f3f3ed'}}>
                </SidebarFooter>
            </Sidebar>
        </SidebarProvider>
    )
}

export default AppSidebar