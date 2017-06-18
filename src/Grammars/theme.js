
export default function registerTheme(monaco) {
    monaco.editor.defineTheme('vs-assembleash', {
    	base:    'vs-dark',
    	inherit: true,
    	rules: [
    		{ token: 'comment', foreground: 'ff0000' }
    	]
    });
}
