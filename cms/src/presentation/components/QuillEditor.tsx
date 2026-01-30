import Quill from 'quill';
import 'quill/dist/quill.snow.css';
import { useEffect, useRef } from 'react';

interface QuillEditorProps {
    value: string;
    onChange: (value: string) => void;
    placeholder?: string;
}

const QuillEditor = ({ value, onChange, placeholder }: QuillEditorProps) => {
    const containerRef = useRef<HTMLDivElement>(null);
    const quillRef = useRef<Quill | null>(null);
    const isInitializing = useRef(false);

    useEffect(() => {
        if (!containerRef.current || isInitializing.current) return;

        isInitializing.current = true;

        // Create editor container
        const editorContainer = document.createElement('div');
        containerRef.current.innerHTML = '';
        containerRef.current.appendChild(editorContainer);

        // Initialize Quill
        const quill = new Quill(editorContainer, {
            theme: 'snow',
            placeholder: placeholder || 'Nhập nội dung...',
            modules: {
                toolbar: [
                    [{ 'header': [1, 2, 3, false] }],
                    ['bold', 'italic', 'underline', 'strike'],
                    [{ 'color': [] }, { 'background': [] }],
                    [{ 'list': 'ordered' }, { 'list': 'bullet' }],
                    ['link', 'blockquote', 'code-block'],
                    ['clean']
                ]
            }
        });

        quillRef.current = quill;

        // Set initial value
        if (value) {
            quill.root.innerHTML = value;
        }

        // Listen for changes
        quill.on('text-change', () => {
            const html = quill.root.innerHTML;
            onChange(html === '<p><br></p>' ? '' : html);
        });

        return () => {
            quillRef.current = null;
            isInitializing.current = false;
        };
    }, []);

    // Update content when value changes externally
    useEffect(() => {
        if (quillRef.current && value !== quillRef.current.root.innerHTML) {
            const selection = quillRef.current.getSelection();
            quillRef.current.root.innerHTML = value || '';
            if (selection) {
                quillRef.current.setSelection(selection);
            }
        }
    }, [value]);

    return (
        <>
            <div
                ref={containerRef}
                className="quill-dark-theme"
            />
            <style>{`
                .quill-dark-theme .ql-toolbar {
                    background: rgba(255, 255, 255, 0.02);
                    border: 1px solid rgba(255, 255, 255, 0.1) !important;
                    border-bottom: none !important;
                    border-radius: 0.75rem 0.75rem 0 0;
                }
                .quill-dark-theme .ql-container {
                    background: rgba(255, 255, 255, 0.02);
                    border: 1px solid rgba(255, 255, 255, 0.1) !important;
                    border-radius: 0 0 0.75rem 0.75rem;
                    min-height: 350px;
                    font-family: 'Inter', sans-serif;
                    font-size: 0.875rem;
                }
                .quill-dark-theme .ql-editor {
                    color: #e4e4e7;
                    min-height: 350px;
                    line-height: 1.8;
                }
                .quill-dark-theme .ql-editor.ql-blank::before {
                    color: rgba(255, 255, 255, 0.25);
                    font-style: normal;
                }
                .quill-dark-theme .ql-stroke {
                    stroke: #71717a !important;
                }
                .quill-dark-theme .ql-fill {
                    fill: #71717a !important;
                }
                .quill-dark-theme .ql-picker {
                    color: #71717a !important;
                }
                .quill-dark-theme .ql-picker-options {
                    background: #18181b !important;
                    border: 1px solid rgba(255, 255, 255, 0.1) !important;
                    border-radius: 0.5rem;
                    box-shadow: 0 10px 40px -10px rgba(0, 0, 0, 0.5);
                }
                .quill-dark-theme .ql-picker-item {
                    color: #a1a1aa !important;
                }
                .quill-dark-theme .ql-picker-item:hover {
                    color: #fff !important;
                }
                .quill-dark-theme .ql-toolbar button:hover .ql-stroke,
                .quill-dark-theme .ql-toolbar button.ql-active .ql-stroke,
                .quill-dark-theme .ql-toolbar .ql-picker-label:hover .ql-stroke {
                    stroke: #6366f1 !important;
                }
                .quill-dark-theme .ql-toolbar button:hover .ql-fill,
                .quill-dark-theme .ql-toolbar button.ql-active .ql-fill {
                    fill: #6366f1 !important;
                }
                .quill-dark-theme .ql-toolbar button:hover,
                .quill-dark-theme .ql-toolbar button.ql-active {
                    background: rgba(99, 102, 241, 0.1);
                    border-radius: 0.25rem;
                }
                .quill-dark-theme .ql-snow .ql-tooltip {
                    background: #18181b !important;
                    border: 1px solid rgba(255, 255, 255, 0.1) !important;
                    color: #fff;
                    border-radius: 0.5rem;
                    box-shadow: 0 10px 40px -10px rgba(0, 0, 0, 0.5);
                }
                .quill-dark-theme .ql-snow .ql-tooltip input[type=text] {
                    background: rgba(255, 255, 255, 0.05);
                    border: 1px solid rgba(255, 255, 255, 0.1);
                    border-radius: 0.375rem;
                    color: #fff;
                }
                .quill-dark-theme .ql-snow a {
                    color: #6366f1 !important;
                }
                .quill-dark-theme .ql-editor h1 {
                    font-size: 1.5rem;
                    font-weight: 700;
                    color: #fff;
                }
                .quill-dark-theme .ql-editor h2 {
                    font-size: 1.25rem;
                    font-weight: 600;
                    color: #fff;
                }
                .quill-dark-theme .ql-editor h3 {
                    font-size: 1.1rem;
                    font-weight: 600;
                    color: #e4e4e7;
                }
                .quill-dark-theme .ql-editor blockquote {
                    border-left: 4px solid #6366f1;
                    padding-left: 1rem;
                    color: #a1a1aa;
                    font-style: italic;
                }
                .quill-dark-theme .ql-editor pre.ql-syntax {
                    background: rgba(0, 0, 0, 0.3);
                    border-radius: 0.5rem;
                    color: #a5f3fc;
                    font-family: 'Fira Code', 'Monaco', monospace;
                }
            `}</style>
        </>
    );
};

export default QuillEditor;
