/// <reference types="react" />

declare module 'lucide-react' {
  import { FC, SVGProps } from 'react'
  
  export interface IconProps extends SVGProps<SVGSVGElement> {
    size?: number | string
    strokeWidth?: number | string
  }

  export const Calendar: FC<IconProps>
  export const Layers: FC<IconProps>
  // Add other icons as needed
}
