import React, { useState } from 'react';
import { createPortal } from 'react-dom';
import { Handle, Position, NodeProps, NodeResizer } from '@xyflow/react';
import { Trash2, Image as ImageIcon, Check, Pencil, X } from 'lucide-react';

export function TextNode({ data, id, selected }: NodeProps) {
  const [content, setContent] = useState<string>((data.content as string) || 'Note or context...');
  const [mediaUrl, setMediaUrl] = useState<string>((data.mediaUrl as string) || '');
  const [showMediaInput, setShowMediaInput] = useState<boolean>(false);
  const [isFullscreenPreview, setIsFullscreenPreview] = useState<boolean>(false);

  const updateContent = (value: string) => {
    setContent(value);
    if (typeof data.onContentChange === 'function') {
      data.onContentChange(id, value);
    }
  };

  const updateMediaUrl = (value: string) => {
    setMediaUrl(value);
    if (typeof data.onMediaUrlChange === 'function') {
      data.onMediaUrlChange(id, value);
    }
  };

  const handleDelete = (e: React.MouseEvent) => {
    if (e.shiftKey || window.confirm('Are you sure you want to delete this note?')) {
      if (typeof data.onDelete === 'function') {
        data.onDelete(id);
      }
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter') {
      setShowMediaInput(false);
    }
  };

  const getYouTubeId = (url: string) => {
    const regExp = /^.*(youtu.be\/|v\/|u\/\w\/|embed\/|watch\?v=|&v=)([^#&?]*).*/;
    const match = url.match(regExp);
    return (match && match[2].length === 11) ? match[2] : null;
  };

  const isYouTube = (url: string) => getYouTubeId(url) !== null;

  return (
    <>
      <NodeResizer
        color="var(--note-color)"
        isVisible={selected}
        minWidth={192}
        minHeight={100}
        keepAspectRatio={mediaUrl !== ''}
      />
      <div className="border-2 rounded-lg shadow-lg group flex flex-col w-full h-full" style={{ borderColor: 'var(--note-color)', backgroundColor: 'var(--text-bg)' }}>
        <Handle type="target" position={Position.Top} className="w-5 h-5 border-2 border-gray-900 dark:border-gray-100" style={{ backgroundColor: 'var(--note-color)' }} />

        <div className="p-1.5 rounded-t-sm font-bold text-xs flex justify-between items-center" style={{ backgroundColor: 'var(--note-color)', color: 'var(--text-bg)' }}>
          <span>Note / Event</span>
          <div className="flex gap-1">
            <button
              onClick={() => setShowMediaInput(!showMediaInput)}
              className="hover:opacity-80 p-1 rounded opacity-0 group-hover:opacity-100 transition-opacity"
              title={mediaUrl ? "Edit Media URL" : "Add Image / YouTube URL"}
            >
              {mediaUrl ? <Pencil size={12} /> : <ImageIcon size={12} />}
            </button>
            <button
              onClick={handleDelete}
              className="hover:text-red-300 hover:opacity-80 p-1 rounded opacity-0 group-hover:opacity-100 transition-opacity"
              title="Delete Node (Shift+Click to bypass confirm)"
            >
              <Trash2 size={12} />
            </button>
          </div>
        </div>

        {showMediaInput && (
          <div className="px-2 pt-2 pb-0 flex gap-1 items-center">
            <input
              type="text"
              placeholder="Paste URL (Press Enter to close)"
              className="flex-1 text-xs p-1 border rounded nodrag focus:outline-none"
              style={{ backgroundColor: 'var(--text-bg)', color: 'var(--text-color)', borderColor: 'var(--note-color)' }}
              value={mediaUrl}
              onChange={(e) => updateMediaUrl(e.target.value)}
              onKeyDown={handleKeyDown}
              autoFocus
            />
            <button
              onClick={() => setShowMediaInput(false)}
              className="p-1 rounded transition-colors opacity-80 hover:opacity-100"
              style={{ color: 'var(--note-color)' }}
              title="Confirm & Close"
            >
               <Check size={14} />
            </button>
          </div>
        )}

        {mediaUrl && (
          <div className="w-full flex-1 min-h-0 flex items-center justify-center bg-black/5 dark:bg-black/20 mt-2 relative">
            {isYouTube(mediaUrl) ? (
              <iframe
                className="w-full h-full object-cover nodrag"
                src={`https://www.youtube.com/embed/${getYouTubeId(mediaUrl)}`}
                title="YouTube video player"
                frameBorder="0"
                allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                allowFullScreen
              ></iframe>
            ) : (
              <img
                src={mediaUrl}
                alt="Node media"
                className="w-full h-full object-contain cursor-pointer"
                title="Click to view full image"
                onClick={() => setIsFullscreenPreview(true)}
                onError={(e) => {
                  (e.target as HTMLImageElement).src = 'data:image/svg+xml;utf8,<svg xmlns="http://www.w3.org/2000/svg" width="100%" height="100%" viewBox="0 0 24 24" fill="none" stroke="gray" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><rect x="3" y="3" width="18" height="18" rx="2" ry="2"></rect><circle cx="8.5" cy="8.5" r="1.5"></circle><polyline points="21 15 16 10 5 21"></polyline></svg>';
                  (e.target as HTMLImageElement).title = "Failed to load image";
                }}
              />
            )}
          </div>
        )}

        <div className="p-2 w-full flex-none">
          <textarea
            className="w-full h-full text-sm p-2 bg-transparent border-none focus:ring-0 resize-none nodrag"
            style={{ color: 'var(--text-color)' }}
            rows={mediaUrl ? 2 : 3}
            value={content}
            onChange={(e) => updateContent(e.target.value)}
            placeholder="Enter text..."
          />
        </div>

        <Handle type="source" position={Position.Bottom} className="w-5 h-5 border-2 border-gray-900 dark:border-gray-100 hover:scale-110 transition-transform" style={{ backgroundColor: 'var(--note-color)' }} />
      </div>

      {/* Lightbox Portal */}
      {isFullscreenPreview && typeof document !== 'undefined' && createPortal(
        <div
           className="fixed inset-0 z-[9999] bg-black/90 flex items-center justify-center p-8 backdrop-blur-sm cursor-pointer"
           onClick={() => setIsFullscreenPreview(false)}
        >
           <button
             className="absolute top-6 right-6 text-white hover:text-red-500 bg-black/50 p-2 rounded-full transition-colors"
             onClick={(e) => { e.stopPropagation(); setIsFullscreenPreview(false); }}
           >
             <X size={24} />
           </button>
           <img
              src={mediaUrl}
              alt="Fullscreen media"
              className="max-w-full max-h-full object-contain shadow-2xl rounded"
              onClick={(e) => e.stopPropagation()} // Prevent clicking image from closing it immediately
           />
        </div>,
        document.body
      )}
    </>
  );
}
