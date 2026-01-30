import {
    closestCenter,
    DndContext,
    DragEndEvent,
    DragOverEvent,
    DragOverlay,
    DragStartEvent,
    PointerSensor,
    useSensor,
    useSensors,
} from '@dnd-kit/core';
import {
    arrayMove,
    horizontalListSortingStrategy,
    SortableContext,
    useSortable,
    verticalListSortingStrategy,
} from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import {
    Columns,
    Copyright,
    Facebook,
    GripHorizontal,
    Info,
    Layout,
    Mail,
    Phone,
    Plus,
    Save,
    Settings,
    Trash2,
    Type,
    X
} from 'lucide-react';
import React, { useEffect, useState } from 'react';
import toast from 'react-hot-toast';
import { api } from '../../infrastructure/api.service';
import CustomSelect from '../components/CustomSelect';

interface FooterBlock {
    id: string;
    type: string;
    title: string;
    settings: any;
}

interface FooterStructure {
    layout: 'columns' | 'centered';
    main: {
        col1: FooterBlock[];
        col2: FooterBlock[];
        col3: FooterBlock[];
        col4: FooterBlock[];
    };
    bottom: FooterBlock[];
}

const AVAILABLE_BLOCKS = [
    { type: 'about', title: 'Giới thiệu & Logo', icon: <Info size={18} /> },
    { type: 'menu', title: 'Danh mục liên kết', icon: <Layout size={18} /> },
    { type: 'contact', title: 'Thông tin liên hệ', icon: <Phone size={18} /> },
    { type: 'newsletter', title: 'Đăng ký nhận tin', icon: <Mail size={18} /> },
    { type: 'social', title: 'Mạng xã hội', icon: <Facebook size={18} /> },
    { type: 'copyright', title: 'Bản quyền & Năm', icon: <Copyright size={18} /> },
    { type: 'text', title: 'Đoạn văn tự do', icon: <Type size={18} /> },
];

const SortableBlock: React.FC<{
    block: FooterBlock;
    onEdit: (block: FooterBlock) => void;
    onDelete: (id: string) => void;
    isOverlay?: boolean;
}> = ({ block, onEdit, onDelete, isOverlay }) => {
    const {
        attributes,
        listeners,
        setNodeRef,
        transform,
        transition,
        isDragging,
    } = useSortable({ id: block.id });

    const style = {
        transform: CSS.Transform.toString(transform),
        transition,
        opacity: isDragging ? 0.3 : 1,
    };

    return (
        <div
            ref={setNodeRef}
            style={style}
            className={`
                flex items-center gap-3 bg-[#111114] border border-white/10 rounded-xl p-3 transition-all group
                ${isOverlay ? 'shadow-2xl border-indigo-500 scale-105 bg-[#151518] z-[100]' : 'hover:border-indigo-500/50'}
            `}
        >
            <div {...attributes} {...listeners} className="cursor-grab active:cursor-grabbing text-zinc-600 hover:text-white transition-colors">
                <GripHorizontal size={16} />
            </div>

            <div className="w-8 h-8 bg-indigo-500/10 rounded-lg flex items-center justify-center text-indigo-400 shrink-0">
                {block.type === 'about' && <Info size={16} />}
                {block.type === 'menu' && <Layout size={16} />}
                {block.type === 'contact' && <Phone size={16} />}
                {block.type === 'newsletter' && <Mail size={16} />}
                {block.type === 'social' && <Facebook size={16} />}
                {block.type === 'copyright' && <Copyright size={16} />}
                {block.type === 'text' && <Type size={16} />}
            </div>

            <div className="flex-1 min-w-0">
                <div className="text-xs font-bold text-zinc-200 truncate">{block.title}</div>
                <div className="text-[9px] text-zinc-600 uppercase tracking-widest font-bold">{block.type}</div>
            </div>

            <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity shrink-0">
                <button onClick={() => onEdit(block)} className="p-1.5 text-zinc-500 hover:text-indigo-400 hover:bg-indigo-400/10 rounded-lg transition-colors">
                    <Settings size={14} />
                </button>
                <button onClick={() => onDelete(block.id)} className="p-1.5 text-zinc-500 hover:text-red-400 hover:bg-red-400/10 rounded-lg transition-colors">
                    <Trash2 size={14} />
                </button>
            </div>
        </div>
    );
};

const DroppableZone: React.FC<{
    id: string;
    blocks: FooterBlock[];
    label: string;
    onEdit: (block: FooterBlock) => void;
    onDelete: (id: string) => void;
    horizontal?: boolean;
}> = ({ id, blocks, label, onEdit, onDelete, horizontal }) => {
    return (
        <div className={`flex flex-col min-h-[120px] relative group/zone ${horizontal ? 'flex-1' : 'w-full'}`}>
            <div className="absolute top-2 left-3 text-[9px] font-black uppercase tracking-widest text-zinc-700 pointer-events-none group-hover/zone:text-zinc-500 transition-colors z-10">
                {label}
            </div>
            <div className={`
                flex-1 bg-white/[0.01] border border-dashed border-white/5 rounded-2xl p-4 flex gap-3 transition-all group-hover/zone:bg-white/[0.02] group-hover/zone:border-white/10
                ${horizontal ? 'flex-row items-center justify-center flex-wrap' : 'flex-col'}
            `}>
                <SortableContext
                    items={blocks.map(b => b.id)}
                    strategy={horizontal ? horizontalListSortingStrategy : verticalListSortingStrategy}
                >
                    {blocks.map(block => (
                        <SortableBlock key={block.id} block={block} onEdit={onEdit} onDelete={onDelete} />
                    ))}
                    {blocks.length === 0 && (
                        <div className="flex-1 flex items-center justify-center text-[10px] text-zinc-800 font-bold uppercase tracking-widest italic select-none">
                            Kéo thả vào đây
                        </div>
                    )}
                </SortableContext>
            </div>
        </div>
    );
};

const FooterBuilder = () => {
    const [structure, setStructure] = useState<FooterStructure>({
        layout: 'columns',
        main: { col1: [], col2: [], col3: [], col4: [] },
        bottom: []
    });
    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);
    const [activeId, setActiveId] = useState<string | null>(null);
    const [editingBlock, setEditingBlock] = useState<FooterBlock | null>(null);

    const [menus, setMenus] = useState<any[]>([]);
    const sensors = useSensors(useSensor(PointerSensor, { activationConstraint: { distance: 8 } }));

    useEffect(() => {
        fetchLayout();
        fetchMenus();
    }, []);

    const fetchMenus = async () => {
        try {
            const { data } = await api.get('/menus');
            setMenus(data);
        } catch (error) { console.error(error); }
    };

    const fetchLayout = async () => {
        try {
            setLoading(true);
            const { data } = await api.get('/layout/footer');
            if (data && data.structure) {
                const parsed = JSON.parse(data.structure);
                if (parsed.main && parsed.bottom) {
                    setStructure(parsed);
                } else if (Array.isArray(parsed)) {
                    // Migration
                    setStructure({
                        layout: 'centered',
                        main: { col1: parsed, col2: [], col3: [], col4: [] },
                        bottom: []
                    });
                }
            } else {
                // Default structure based on user feedback
                setStructure({
                    layout: 'centered',
                    main: {
                        col1: [
                            { id: 'f-1', type: 'about', title: 'Logo & Mô tả', settings: {} },
                            { id: 'f-2', type: 'menu', title: 'Liên kết chân trang', settings: {} }
                        ],
                        col2: [], col3: [], col4: []
                    },
                    bottom: [{ id: 'f-3', type: 'copyright', title: 'Bản quyền website', settings: {} }]
                });
            }
        } catch (error) { console.error(error); } finally { setLoading(false); }
    };

    const handleSave = async () => {
        try {
            setSaving(true);
            await api.patch('/layout/footer', { structure: JSON.stringify(structure) });
            toast.success('Đã lưu cấu hình Footer');
        } catch (error) { toast.error('Lưu thất bại'); } finally { setSaving(false); }
    };

    const findContainer = (id: string): { area: 'main' | 'bottom'; key?: keyof FooterStructure['main'] } | null => {
        for (const col of Object.keys(structure.main) as Array<keyof FooterStructure['main']>) {
            if (structure.main[col].some(b => b.id === id) || `zone-main-${col}` === id) {
                return { area: 'main', key: col };
            }
        }
        if (structure.bottom.some(b => b.id === id) || `zone-bottom` === id) {
            return { area: 'bottom' };
        }
        return null;
    };

    const handleDragStart = (event: DragStartEvent) => setActiveId(event.active.id as string);

    const handleDragOver = (event: DragOverEvent) => {
        const { active, over } = event;
        if (!over) return;

        const activeId = active.id as string;
        const overId = over.id as string;

        const activeContainer = findContainer(activeId);
        const overContainer = findContainer(overId);

        if (!activeContainer || !overContainer || (activeContainer.area === overContainer.area && activeContainer.key === overContainer.key)) return;

        setStructure(prev => {
            const newStructure = JSON.parse(JSON.stringify(prev));
            let movedItem: FooterBlock;

            if (activeContainer.area === 'main') {
                const idx = prev.main[activeContainer.key!].findIndex(i => i.id === activeId);
                [movedItem] = newStructure.main[activeContainer.key!].splice(idx, 1);
            } else {
                const idx = prev.bottom.findIndex(i => i.id === activeId);
                [movedItem] = newStructure.bottom.splice(idx, 1);
            }

            if (overContainer.area === 'main') {
                if (overId.startsWith('zone-')) {
                    newStructure.main[overContainer.key!].push(movedItem);
                } else {
                    const idx = prev.main[overContainer.key!].findIndex(i => i.id === overId);
                    newStructure.main[overContainer.key!].splice(idx >= 0 ? idx : 0, 0, movedItem);
                }
            } else {
                if (overId === 'zone-bottom') {
                    newStructure.bottom.push(movedItem);
                } else {
                    const idx = prev.bottom.findIndex(i => i.id === overId);
                    newStructure.bottom.splice(idx >= 0 ? idx : 0, 0, movedItem);
                }
            }
            return newStructure;
        });
    };

    const handleDragEnd = (event: DragEndEvent) => {
        const { active, over } = event;
        if (!over) { setActiveId(null); return; }

        const activeId = active.id as string;
        const overId = over.id as string;
        const activeContainer = findContainer(activeId);
        const overContainer = findContainer(overId);

        if (activeContainer && overContainer && activeContainer.area === overContainer.area && activeContainer.key === overContainer.key) {
            const getItems = () => activeContainer.area === 'main' ? structure.main[activeContainer.key!] : structure.bottom;
            const items = getItems();
            const activeIndex = items.findIndex(i => i.id === activeId);
            const overIndex = items.findIndex(i => i.id === overId);

            if (activeIndex !== overIndex) {
                setStructure(prev => {
                    const newItems = arrayMove(items, activeIndex, overIndex);
                    if (activeContainer.area === 'main') {
                        return { ...prev, main: { ...prev.main, [activeContainer.key!]: newItems } };
                    } else {
                        return { ...prev, bottom: newItems };
                    }
                });
            }
        }
        setActiveId(null);
    };

    const addBlock = (type: string, title: string) => {
        const newBlock: FooterBlock = { id: `f-${Date.now()}`, type, title, settings: {} };
        setStructure(prev => ({
            ...prev,
            main: { ...prev.main, col1: [...prev.main.col1, newBlock] }
        }));
        toast.success(`Đã thêm ${title}`);
    };

    const deleteBlock = (id: string) => {
        const container = findContainer(id);
        if (!container) return;
        setStructure(prev => {
            if (container.area === 'main') {
                return { ...prev, main: { ...prev.main, [container.key!]: prev.main[container.key!].filter(b => b.id !== id) } };
            } else {
                return { ...prev, bottom: prev.bottom.filter(b => b.id !== id) };
            }
        });
    };

    const activeBlock = activeId ? (
        Object.values(structure.main).flat().find(b => b.id === activeId) ||
        structure.bottom.find(b => b.id === activeId)
    ) : null;

    return (
        <div className="flex flex-col gap-6 animate-fade-in font-inter h-[calc(100vh-120px)] overflow-hidden">
            <div className="flex justify-between items-center bg-[#111114] p-4 rounded-2xl border border-white/10 shadow-xl shrink-0">
                <div>
                    <h1 className="text-2xl font-bold text-zinc-100 font-outfit uppercase tracking-tight">Footer Builder</h1>
                    <p className="text-zinc-500 text-xs font-medium">Thiết lập cấu trúc chân trang theo dạng cột hoặc căn giữa (Centered)</p>
                </div>
                <div className="flex items-center gap-4">
                    <div className="flex bg-black/40 p-1 rounded-xl border border-white/5">
                        <button
                            onClick={() => setStructure({ ...structure, layout: 'columns' })}
                            className={`flex items-center gap-2 px-4 py-2 rounded-lg text-xs font-bold transition-all ${structure.layout === 'columns' ? 'bg-indigo-500 text-white shadow-lg shadow-indigo-500/20' : 'text-zinc-500 hover:text-zinc-300'}`}
                        >
                            <Columns size={14} /> Cột
                        </button>
                        <button
                            onClick={() => setStructure({ ...structure, layout: 'centered' })}
                            className={`flex items-center gap-2 px-4 py-2 rounded-lg text-xs font-bold transition-all ${structure.layout === 'centered' ? 'bg-indigo-500 text-white shadow-lg shadow-indigo-500/20' : 'text-zinc-500 hover:text-zinc-300'}`}
                        >
                            <Layout size={14} /> Căn giữa
                        </button>
                    </div>
                    <button onClick={handleSave} disabled={saving} className="flex items-center gap-2 px-6 py-2.5 bg-indigo-500 hover:bg-indigo-600 text-white rounded-xl text-sm font-bold shadow-lg shadow-indigo-500/20 active:scale-95 transition-all disabled:opacity-50">
                        <Save size={18} /> {saving ? 'Đang lưu...' : 'Lưu giao diện'}
                    </button>
                </div>
            </div>

            <div className="flex gap-6 overflow-hidden flex-1">
                <div className="w-64 bg-[#111114] border border-white/10 rounded-2xl p-6 flex flex-col shrink-0">
                    <h2 className="text-[10px] font-black text-zinc-600 uppercase tracking-widest mb-6">Thành phần Footer</h2>
                    <div className="space-y-2 overflow-y-auto pr-2 custom-scrollbar flex-1">
                        {AVAILABLE_BLOCKS.map(block => (
                            <button
                                key={block.type}
                                onClick={() => addBlock(block.type, block.title)}
                                className="w-full flex items-center gap-3 p-3 bg-white/[0.01] border border-white/5 rounded-xl hover:border-indigo-500/50 hover:bg-white/[0.03] transition-all group text-left"
                            >
                                <div className="w-8 h-8 rounded-lg bg-white/5 flex items-center justify-center text-zinc-500 group-hover:text-indigo-400 transition-colors">
                                    {block.icon}
                                </div>
                                <span className="text-[11px] font-bold text-zinc-500 group-hover:text-zinc-300 transition-colors">{block.title}</span>
                                <Plus size={14} className="ml-auto text-zinc-600 opacity-0 group-hover:opacity-100 transition-opacity" />
                            </button>
                        ))}
                    </div>
                </div>

                <div className="flex-1 bg-[#070708] border border-white/10 rounded-2xl p-10 overflow-y-auto custom-scrollbar relative">
                    <div className="max-w-5xl mx-auto space-y-12">
                        <DndContext sensors={sensors} collisionDetection={closestCenter} onDragStart={handleDragStart} onDragOver={handleDragOver} onDragEnd={handleDragEnd}>
                            {/* Main Footer Area */}
                            <div className="space-y-4">
                                <div className="flex items-center gap-4 opacity-30">
                                    <span className="text-[10px] font-black uppercase tracking-widest text-zinc-500">Footer Main Content</span>
                                    <div className="h-px flex-1 bg-zinc-800"></div>
                                </div>

                                <div className={`flex gap-6 ${structure.layout === 'centered' ? 'flex-col items-center' : 'flex-row'}`}>
                                    {structure.layout === 'columns' ? (
                                        (['col1', 'col2', 'col3', 'col4'] as const).map(col => (
                                            <DroppableZone key={col} id={`zone-main-${col}`} blocks={structure.main[col]} label={`Cột ${col.slice(-1)}`} onEdit={setEditingBlock} onDelete={deleteBlock} />
                                        ))
                                    ) : (
                                        <DroppableZone id={`zone-main-col1`} blocks={structure.main.col1} label="Nội dung chính (Centered)" onEdit={setEditingBlock} onDelete={deleteBlock} />
                                    )}
                                </div>
                            </div>

                            {/* Bottom Footer Area */}
                            <div className="space-y-4 pt-10 border-t border-white/5">
                                <div className="flex items-center gap-4 opacity-30">
                                    <span className="text-[10px] font-black uppercase tracking-widest text-zinc-500">Footer Bottom Bar</span>
                                    <div className="h-px flex-1 bg-zinc-800"></div>
                                </div>
                                <DroppableZone id="zone-bottom" blocks={structure.bottom} label="Copyright & Công cụ" onEdit={setEditingBlock} onDelete={deleteBlock} horizontal />
                            </div>

                            <DragOverlay>
                                {activeId && activeBlock ? <SortableBlock block={activeBlock} onEdit={() => { }} onDelete={() => { }} isOverlay /> : null}
                            </DragOverlay>
                        </DndContext>

                        <div className="p-8 bg-indigo-500/[0.02] border border-indigo-500/10 rounded-3xl text-center space-y-3">
                            <h3 className="text-xs font-black text-indigo-500 uppercase tracking-[0.2em]">Preview Architecture</h3>
                            <p className="text-xs text-zinc-600 max-w-xl mx-auto leading-relaxed">
                                Cấu trúc này mô phỏng cách chân trang hiển thị thực tế.
                                Hàng chính (Main) có thể chia cột hoặc căn giữa tùy theo ý muốn.
                                Hàng đáy (Bottom) thường dùng cho bản quyền và các liên kết pháp lý.
                            </p>
                        </div>
                    </div>
                </div>
            </div>

            {editingBlock && (
                <div className="fixed inset-0 bg-black/90 flex items-center justify-center z-[100] p-4 animate-fade-in backdrop-blur-md">
                    <div className="bg-[#111114] border border-white/10 rounded-3xl w-full max-w-md p-8 animate-zoom-in shadow-2xl">
                        <div className="flex items-center justify-between mb-8">
                            <h3 className="text-xl font-bold text-white font-outfit uppercase underline underline-offset-8 decoration-indigo-500 decoration-2">Thiết lập Block</h3>
                            <button onClick={() => setEditingBlock(null)} className="text-zinc-500 hover:text-white transition-colors"><X size={24} /></button>
                        </div>
                        <div className="space-y-6">
                            <div>
                                <label className="block text-[10px] font-black text-zinc-500 uppercase tracking-widest mb-3 pl-1">Tiêu đề hiển thị</label>
                                <input
                                    type="text"
                                    className="w-full bg-black/40 border border-white/10 rounded-2xl px-5 py-4 text-white focus:border-indigo-500 outline-none transition-all font-bold"
                                    value={editingBlock.title}
                                    onChange={e => setEditingBlock({ ...editingBlock, title: e.target.value })}
                                />
                            </div>
                            <div className="p-6 bg-white/[0.01] border border-white/5 rounded-2xl space-y-4">
                                {editingBlock.type === 'menu' && (
                                    <div className="space-y-2">
                                        <CustomSelect
                                            label="Chọn Menu liên kết"
                                            value={editingBlock.settings?.menuId || ''}
                                            onChange={val => setEditingBlock({ ...editingBlock, settings: { ...editingBlock.settings, menuId: val } })}
                                            options={[
                                                { value: '', label: '-- Chọn Menu --' },
                                                ...menus.map(m => ({ value: m.id, label: m.name }))
                                            ]}
                                        />
                                    </div>
                                )}
                                <div className="italic text-[11px] text-zinc-600 text-center leading-relaxed">
                                    Các tùy chọn nâng cao cho "{editingBlock.type.toUpperCase()}" như căn lề, font-size, màu sắc riêng sẽ được cập nhật trong phiên bản tiếp theo.
                                </div>
                            </div>
                        </div>
                        <div className="mt-10 flex gap-4">
                            <button onClick={() => setEditingBlock(null)} className="flex-1 py-4 bg-white/5 text-zinc-500 hover:bg-white/10 rounded-2xl font-bold transition-all">Đóng</button>
                            <button
                                onClick={() => {
                                    setStructure(prev => {
                                        const c = findContainer(editingBlock.id);
                                        if (!c) return prev;
                                        if (c.area === 'main') {
                                            const n = prev.main[c.key!].map(b => b.id === editingBlock.id ? editingBlock : b);
                                            return { ...prev, main: { ...prev.main, [c.key!]: n } };
                                        } else {
                                            return { ...prev, bottom: prev.bottom.map(b => b.id === editingBlock.id ? editingBlock : b) };
                                        }
                                    });
                                    setEditingBlock(null);
                                    toast.success('Cập nhật thành công');
                                }}
                                className="flex-1 py-4 bg-indigo-500 hover:bg-indigo-600 text-white rounded-2xl font-bold shadow-xl shadow-indigo-500/20 active:scale-[0.98] transition-all"
                            >
                                Xác nhận
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default FooterBuilder;
