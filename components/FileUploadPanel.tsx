import React, { useState, useRef } from 'react';
import { supabase } from '../services/supabaseClient';

// pdf.js is loaded lazily only when a PDF is uploaded
let pdfjsLib: any = null;
async function loadPdfJs() {
    if (!pdfjsLib) {
        // @ts-ignore
        pdfjsLib = await import('https://esm.sh/pdfjs-dist@4.9.155/build/pdf.min.mjs');
        pdfjsLib.GlobalWorkerOptions.workerSrc = 'https://esm.sh/pdfjs-dist@4.9.155/build/pdf.worker.min.mjs';
    }
    return pdfjsLib;
}

interface FileUploadPanelProps {
    courseId: string;
    onUploadComplete: (message: string) => void;
}

const FileUploadPanel: React.FC<FileUploadPanelProps> = ({ courseId, onUploadComplete }) => {
    const [isUploading, setIsUploading] = useState(false);
    const [uploadStatus, setUploadStatus] = useState<string | null>(null);
    const [dragOver, setDragOver] = useState(false);
    const [uploadedFiles, setUploadedFiles] = useState<string[]>([]);
    const fileInputRef = useRef<HTMLInputElement>(null);

    const chunkText = (text: string, chunkSize: number = 800): string[] => {
        const chunks: string[] = [];
        const paragraphs = text.split(/\n\s*\n/);
        let currentChunk = '';

        for (const para of paragraphs) {
            if ((currentChunk + '\n\n' + para).length > chunkSize && currentChunk.length > 0) {
                chunks.push(currentChunk.trim());
                currentChunk = para;
            } else {
                currentChunk += (currentChunk ? '\n\n' : '') + para;
            }
        }
        if (currentChunk.trim()) {
            chunks.push(currentChunk.trim());
        }
        return chunks;
    };

    const extractTextFromPDF = async (file: File): Promise<string> => {
        setUploadStatus('Loading PDF reader...');
        const pdfjs = await loadPdfJs();
        const arrayBuffer = await file.arrayBuffer();
        const pdf = await pdfjs.getDocument({ data: arrayBuffer }).promise;
        const totalPages = pdf.numPages;
        const textParts: string[] = [];

        for (let i = 1; i <= totalPages; i++) {
            setUploadStatus(`Reading PDF page ${i}/${totalPages}...`);
            const page = await pdf.getPage(i);
            const content = await page.getTextContent();
            const pageText = content.items
                .map((item: any) => item.str)
                .join(' ')
                .replace(/\s+/g, ' ')
                .trim();
            if (pageText) {
                textParts.push(pageText);
            }
        }

        return textParts.join('\n\n');
    };

    const processFile = async (file: File) => {
        setIsUploading(true);
        setUploadStatus(`Reading ${file.name}...`);

        try {
            let text = '';
            const ext = file.name.split('.').pop()?.toLowerCase();

            if (ext === 'pdf' || file.type === 'application/pdf') {
                text = await extractTextFromPDF(file);
            } else if (ext === 'txt' || ext === 'md' || file.type === 'text/plain') {
                text = await file.text();
            } else if (ext === 'csv' || file.type === 'text/csv') {
                text = await file.text();
            } else if (ext === 'json') {
                const raw = await file.text();
                const parsed = JSON.parse(raw);
                text = typeof parsed === 'string' ? parsed : JSON.stringify(parsed, null, 2);
            } else {
                setUploadStatus(`❌ Unsupported file type: .${ext}. Use .pdf, .txt, .md, .csv, or .json`);
                setIsUploading(false);
                return;
            }

            if (!text.trim()) {
                setUploadStatus('❌ No text found in file');
                setIsUploading(false);
                return;
            }

            const chunks = chunkText(text);
            setUploadStatus(`Inserting ${chunks.length} chunks from ${file.name}...`);

            let inserted = 0;
            for (let i = 0; i < chunks.length; i++) {
                const chunk = chunks[i];
                const title = `${file.name} - Part ${i + 1}`;

                const { error } = await supabase
                    .from('knowledge_base')
                    .insert({
                        course_id: courseId,
                        title: title,
                        content: chunk,
                        source_document: file.name,
                    });

                if (error) {
                    console.error(`Error inserting chunk ${i + 1}:`, error);
                } else {
                    inserted++;
                }
                setUploadStatus(`Inserting chunk ${i + 1}/${chunks.length}...`);
            }

            const msg = `✅ Uploaded ${file.name}: ${inserted}/${chunks.length} chunks`;
            setUploadStatus(msg);
            setUploadedFiles(prev => [...prev, file.name]);
            onUploadComplete(msg);
        } catch (error) {
            setUploadStatus(`❌ Error: ${error}`);
        } finally {
            setIsUploading(false);
        }
    };

    const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const files = e.target.files;
        if (files && files.length > 0) {
            processFile(files[0]);
        }
        e.target.value = '';
    };

    const handleDrop = (e: React.DragEvent) => {
        e.preventDefault();
        setDragOver(false);
        const files = e.dataTransfer.files;
        if (files && files.length > 0) {
            processFile(files[0]);
        }
    };

    // Render inline (no modal/portal)
    return (
        <div>
            {/* Drop zone */}
            <div
                onDragOver={(e) => { e.preventDefault(); setDragOver(true); }}
                onDragLeave={() => setDragOver(false)}
                onDrop={handleDrop}
                onClick={() => !isUploading && fileInputRef.current?.click()}
                className={`border-2 border-dashed rounded-xl p-8 text-center cursor-pointer transition-all ${dragOver
                    ? 'border-blue-400 bg-blue-50'
                    : 'border-gray-300 hover:border-blue-300 hover:bg-gray-50'
                    } ${isUploading ? 'pointer-events-none opacity-60' : ''}`}
            >
                <input
                    ref={fileInputRef}
                    type="file"
                    accept=".pdf,.txt,.md,.csv,.json"
                    onChange={handleFileChange}
                    className="hidden"
                />
                <div className="text-4xl mb-3">
                    {isUploading ? '⏳' : dragOver ? '📥' : '📄'}
                </div>
                <p className="font-semibold text-gray-700 mb-1">
                    {isUploading ? 'Processing...' : 'Drop file here or click to browse'}
                </p>
                <p className="text-xs text-gray-400">
                    PDF, TXT, MD, CSV, JSON
                </p>
            </div>

            {/* Supported formats */}
            <div className="mt-4 flex flex-wrap gap-2">
                {[
                    { ext: 'PDF', icon: '📕', color: 'bg-red-50 text-red-600 border-red-100' },
                    { ext: 'TXT', icon: '📄', color: 'bg-blue-50 text-blue-600 border-blue-100' },
                    { ext: 'MD', icon: '📝', color: 'bg-purple-50 text-purple-600 border-purple-100' },
                    { ext: 'CSV', icon: '📊', color: 'bg-green-50 text-green-600 border-green-100' },
                    { ext: 'JSON', icon: '🔧', color: 'bg-amber-50 text-amber-600 border-amber-100' },
                ].map(f => (
                    <span key={f.ext} className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-[10px] font-bold border ${f.color}`}>
                        {f.icon} .{f.ext}
                    </span>
                ))}
            </div>

            {/* Upload status */}
            {uploadStatus && (
                <div className={`mt-4 px-4 py-3 rounded-lg text-sm font-medium ${uploadStatus.startsWith('✅')
                    ? 'bg-green-50 text-green-700 border border-green-100'
                    : uploadStatus.startsWith('❌')
                        ? 'bg-red-50 text-red-700 border border-red-100'
                        : 'bg-blue-50 text-blue-700 border border-blue-100'
                    }`}>
                    {uploadStatus}
                </div>
            )}

            {/* Uploaded files list */}
            {uploadedFiles.length > 0 && (
                <div className="mt-5">
                    <h4 className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-2">Uploaded Files</h4>
                    <div className="space-y-2">
                        {uploadedFiles.map((name, i) => (
                            <div key={i} className="flex items-center gap-3 px-3 py-2.5 bg-gray-50 rounded-lg border border-gray-100">
                                <span className="text-lg">
                                    {name.endsWith('.pdf') ? '📕' : name.endsWith('.csv') ? '📊' : '📄'}
                                </span>
                                <span className="text-sm font-medium text-gray-700 truncate flex-1">{name}</span>
                                <span className="text-[10px] font-bold text-green-600 bg-green-50 px-2 py-0.5 rounded-full">Uploaded</span>
                            </div>
                        ))}
                    </div>
                </div>
            )}

            <p className="mt-4 text-[11px] text-gray-400 text-center">
                Files are parsed, chunked, and inserted into the knowledge base instantly
            </p>
        </div>
    );
};

export default FileUploadPanel;
