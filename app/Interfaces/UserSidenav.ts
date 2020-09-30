
interface SidenavMenuIcon {
    enable: boolean
    name: string
}

export interface SidenavMenuChildren {
    url: string
    title: string
    icon: SidenavMenuIcon
}

export interface SidenavMenu {
    url: string
    title: string
    icon?: SidenavMenuIcon
    children?: SidenavMenuChildren[]
}


