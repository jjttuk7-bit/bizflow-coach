import React, { useState, useMemo } from 'react';
import { ChevronDownIcon } from './icons';

const BodyRenderer: React.FC<{ content: string }> = ({ content }) => {
    if (!content) return null;

    const lines = content.split('\n');
    // Fix: Use React.ReactNode[] to avoid issues with the global JSX namespace.
    const elements: React.ReactNode[] = [];
    let listItems: string[] = [];
    let inList = false;
    let tableRows: string[][] = [];
    let inTable = false;

    const flushList = () => {
        if (listItems.length > 0) {
            elements.push(
                <ul key={`ul-${elements.length}`} className="list-disc list-inside space-y-1 my-2">
                    {listItems.map((item, idx) => (
                        <li key={idx} dangerouslySetInnerHTML={{ __html: item }} />
                    ))}
                </ul>
            );
            listItems = [];
        }
        inList = false;
    };
    
    const flushTable = () => {
        if (tableRows.length > 0) {
            const header = tableRows[0];
            const body = tableRows.slice(1);
            elements.push(
                <div key={`table-wrapper-${elements.length}`} className="overflow-x-auto my-4 -mx-4">
                    <table key={`table-${elements.length}`} className="min-w-full divide-y divide-rule border-y border-rule">
                        <thead className="bg-parchment">
                            <tr>
                                {header.map((cell, idx) => <th key={idx} className="px-4 py-2 text-left text-xs font-medium text-slate-ink uppercase tracking-wider">{cell.trim()}</th>)}
                            </tr>
                        </thead>
                        <tbody className="bg-linen divide-y divide-rule">
                            {body.map((row, rIdx) => (
                                <tr key={rIdx} className="hover:bg-parchment">
                                    {row.map((cell, cIdx) => <td key={cIdx} className="px-4 py-3 whitespace-normal text-sm text-carbon" dangerouslySetInnerHTML={{ __html: cell.trim() }}></td>)}
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            );
            tableRows = [];
        }
        inTable = false;
    };

    const processLine = (line: string) => {
        return line
            .replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>')
            .replace(/\*(.*?)\*/g, '<em>$1</em>');
    };

    for (let i = 0; i < lines.length; i++) {
        let line = lines[i];

        const isTableLine = line.trim().startsWith('|') && line.trim().endsWith('|');
        if (isTableLine) {
            flushList();
            inTable = true;
            const row = line.split('|').slice(1, -1).map(cell => processLine(cell));
            if (!line.includes('---')) {
                 tableRows.push(row);
            }
        } else {
            flushTable();
            if (line.startsWith('- ') || line.startsWith('* ')) {
                flushList(); // End previous list if any
                inList = true;
                listItems.push(processLine(line.substring(2)));
            } else if (line.match(/^\d+\.\s/)) {
                 flushList();
                inList = true; // Treat as ul for simplicity
                listItems.push(processLine(line.replace(/^\d+\.\s/, '')));
            } else {
                flushList();
                if (line.trim() !== '') {
                    elements.push(<p key={i} dangerouslySetInnerHTML={{ __html: processLine(line) }} />);
                }
            }
        }
    }
    
    flushList();
    flushTable();

    return <div className="prose prose-sm max-w-none text-ink space-y-2">{elements}</div>;
};


const MarkdownRenderer: React.FC<{ content: string }> = ({ content }) => {
    const [openSections, setOpenSections] = useState<Set<number>>(new Set([0]));

    const sections = useMemo(() => {
        if (!content || !content.includes('### ')) return [];
        
        const lines = content.split('\n');
        const newSections: { title: string, content: string }[] = [];
        let currentContent: string[] = [];
        let currentTitle: string | null = null;

        for (const line of lines) {
            if (line.startsWith('### ')) {
                if (currentTitle !== null) {
                    newSections.push({ title: currentTitle, content: currentContent.join('\n') });
                }
                currentTitle = line.substring(4).trim();
                currentContent = [];
            } else {
                 if (currentTitle !== null) {
                    currentContent.push(line);
                }
            }
        }

        if (currentTitle !== null) {
            newSections.push({ title: currentTitle, content: currentContent.join('\n') });
        }
        
        return newSections.filter(s => s.title.trim() || s.content.trim());
    }, [content]);

    if (!sections.length) {
        return <BodyRenderer content={content} />;
    }

    const toggleSection = (index: number) => {
        setOpenSections(prev => {
            const newSet = new Set(prev);
            if (newSet.has(index)) {
                newSet.delete(index);
            } else {
                newSet.add(index);
            }
            return newSet;
        });
    };

    return (
        <div className="space-y-3">
            {sections.map((section, index) => (
                <div key={index} className="border border-rule rounded-sm overflow-hidden">
                    <button
                        className="w-full flex justify-between items-center p-4 bg-parchment hover:bg-rule focus:outline-none focus:ring-2 focus:ring-ink focus:ring-inset"
                        onClick={() => toggleSection(index)}
                        aria-expanded={openSections.has(index)}
                        aria-controls={`section-content-${index}`}
                    >
                        <h3 className="text-lg font-bold text-ink text-left">{section.title}</h3>
                        <ChevronDownIcon className={`w-6 h-6 text-slate-ink transition-transform duration-300 ${openSections.has(index) ? 'rotate-180' : ''}`} />
                    </button>
                    {openSections.has(index) && (
                        <div id={`section-content-${index}`} className="p-4 bg-linen">
                           <BodyRenderer content={section.content} />
                        </div>
                    )}
                </div>
            ))}
        </div>
    );
};

export default MarkdownRenderer;