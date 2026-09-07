declare module 'pdfmake/build/pdfmake' {
  const pdfMake: any;
  export default pdfMake;
}

declare module 'pdfmake/build/vfs_fonts' {
  const vfsFonts: any;
  export default vfsFonts;
}

declare module 'pdfmake/interfaces' {
  export type Alignment = 'left' | 'right' | 'center' | 'justify';
  export type Content = any;
  export interface TableCell {
    [key: string]: any;
  }
  export interface TDocumentDefinitions {
    pageSize?: string | { width: number; height: number };
    pageMargins?: number[] | [number, number, number, number];
    content: any;
    footer?: any;
    header?: any;
    defaultStyle?: any;
    styles?: any;
  }
}
