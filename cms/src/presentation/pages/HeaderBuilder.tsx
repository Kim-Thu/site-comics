import {
    DndContext,
    DragEndEvent,
    DragOverEvent,
    DragOverlay,
    DragStartEvent,
    PointerSensor,
    rectIntersection,
    useDroppable,
    useSensor,
    useSensors
} from '@dnd-kit/core';
import {
    arrayMove,
    horizontalListSortingStrategy,
    SortableContext,
    useSortable,
} from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import {
    Bell,
    Code,
    GripHorizontal,
    Image as ImageIcon,
    Layout,
    Menu as MenuIcon,
    Play,
    Plus,
    Save,
    Search,
    Settings,
    Trash2,
    User,
    X
} from 'lucide-react';
import React, { useEffect, useState } from 'react';
import toast from 'react-hot-toast';
import { api } from '../../infrastructure/api.service';
import CustomCheckbox from '../components/atoms/CustomCheckbox';
import CustomSelect from '../components/atoms/CustomSelect';
import MediaPickerModal from '../components/MediaPickerModal';

interface HeaderBlock {
    id: string;
    type: string;
    title: string;
    settings: any;
}

interface HeaderStructure {
    top: { left: HeaderBlock[]; center: HeaderBlock[]; right: HeaderBlock[] };
    main: { left: HeaderBlock[]; center: HeaderBlock[]; right: HeaderBlock[] };
    bottom: { left: HeaderBlock[]; center: HeaderBlock[]; right: HeaderBlock[] };
}

const AVAILABLE_BLOCKS = [
    { type: 'logo', title: 'Logo website', icon: <ImageIcon size={18} /> },
    { type: 'menu', title: 'Menu chính', icon: <MenuIcon size={18} /> },
    { type: 'search', title: 'Thanh tìm kiếm', icon: <Search size={18} /> },
    { type: 'actions', title: 'Tiện ích (Bell/BM)', icon: <Bell size={18} /> },
    { type: 'user', title: 'Tài khoản (Login)', icon: <User size={18} /> },
    { type: 'banner-slider', title: 'Banner Slider', icon: <Play size={18} /> },
    { type: 'html', title: 'HTML tùy chỉnh', icon: <Code size={18} /> },
];

const SortableBlock: React.FC<{
    block: HeaderBlock;
    onEdit: (block: HeaderBlock) => void;
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
                flex items-center gap-2 bg-[#1a1a1d] border border-white/10 rounded-lg py-1.5 px-3 transition-all group
                ${isOverlay ? 'shadow-2xl border-indigo-500 scale-105 bg-[#252529]' : 'hover:border-indigo-500/50'}
            `}
        >
            <div {...attributes} {...listeners} className="cursor-grab active:cursor-grabbing text-zinc-600 hover:text-white transition-colors">
                <GripHorizontal size={14} />
            </div>

            <div className="text-indigo-400">
                {block.type === 'logo' && <ImageIcon size={14} />}
                {block.type === 'menu' && <MenuIcon size={14} />}
                {block.type === 'search' && <Search size={14} />}
                {block.type === 'actions' && <Bell size={14} />}
                {block.type === 'user' && <User size={14} />}
                {block.type === 'banner-slider' && <Play size={14} />}
                {block.type === 'html' && <Code size={14} />}
            </div>

            <div className="text-[11px] font-bold text-zinc-300 truncate max-w-[80px]">{block.title}</div>

            <div className="flex items-center gap-0.5 ml-1 opacity-0 group-hover:opacity-100 transition-opacity">
                <button onClick={() => onEdit(block)} className="p-1 text-zinc-500 hover:text-indigo-400">
                    <Settings size={12} />
                </button>
                <button onClick={() => onDelete(block.id)} className="p-1 text-zinc-500 hover:text-red-400">
                    <Trash2 size={12} />
                </button>
            </div>
        </div>
    );
};

const DroppableZone: React.FC<{
    id: string;
    blocks: HeaderBlock[];
    label: string;
    onEdit: (block: HeaderBlock) => void;
    onDelete: (id: string) => void;
}> = ({ id, blocks, label, onEdit, onDelete }) => {
    const { setNodeRef } = useDroppable({ id });

    return (
        <div ref={setNodeRef} className="flex-1 flex flex-col min-h-[60px] relative group/zone">
            <div className="absolute top-1 left-2 text-[8px] font-black uppercase tracking-widest text-zinc-700 pointer-events-none group-hover/zone:text-zinc-500 transition-colors">
                {label}
            </div>
            <div className="flex-1 bg-white/[0.01] border border-dashed border-white/5 rounded-xl p-3 flex flex-wrap gap-2 items-center justify-center transition-all group-hover/zone:bg-white/[0.03] group-hover/zone:border-white/10 min-w-[100px]">
                <SortableContext items={blocks.map(b => b.id)} strategy={horizontalListSortingStrategy}>
                    {blocks.map(block => (
                        <SortableBlock key={block.id} block={block} onEdit={onEdit} onDelete={onDelete} />
                    ))}
                    {blocks.length === 0 && (
                        <div className="text-[10px] text-zinc-700 font-bold uppercase tracking-tighter opacity-0 group-hover/zone:opacity-100 transition-opacity">Empty</div>
                    )}
                </SortableContext>
            </div>
        </div>
    );
};

const HeaderBuilder = () => {
    const [structure, setStructure] = useState<HeaderStructure>({
        top: { left: [], center: [], right: [] },
        main: { left: [], center: [], right: [] },
        bottom: { left: [], center: [], right: [] }
    });
    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);
    const [activeId, setActiveId] = useState<string | null>(null);
    const [editingBlock, setEditingBlock] = useState<HeaderBlock | null>(null);

    const [menus, setMenus] = useState<any[]>([]);
    const [showMediaPicker, setShowMediaPicker] = useState(false);
    const [activeSlideIndex, setActiveSlideIndex] = useState<number | null>(null);
    const sensors = useSensors(useSensor(PointerSensor, { activationConstraint: { distance: 8 } }));

    useEffect(() => {
        fetchLayout();
        fetchMenus();
    }, []);

    const fetchMenus = async () => {
        try {
            const { data } = await api.get('/menus');
            setMenus(data);
        } catch (error) {
            console.error('Error fetching menus');
        }
    };

    const fetchLayout = async () => {
        try {
            setLoading(true);
            const { data } = await api.get('/layout/header');
            if (data && data.structure) {
                const parsed = JSON.parse(data.structure);
                // Handle old format if necessary, but here we assume structure is HeaderStructure
                if (parsed.top && parsed.main && parsed.bottom) {
                    setStructure(parsed);
                } else if (Array.isArray(parsed)) {
                    // Migration: put all old blocks into main.left
                    setStructure({
                        top: { left: [], center: [], right: [] },
                        main: { left: parsed, center: [], right: [] },
                        bottom: { left: [], center: [], right: [] }
                    });
                }
            } else {
                // Default
                setStructure({
                    top: { left: [], center: [], right: [] },
                    main: {
                        left: [{ id: 'logo-1', type: 'logo', title: 'Logo', settings: {} }],
                        center: [{ id: 'menu-1', type: 'menu', title: 'Menu', settings: {} }],
                        right: [
                            { id: 'search-1', type: 'search', title: 'Search', settings: {} },
                            { id: 'actions-1', type: 'actions', title: 'Utility', settings: {} },
                            { id: 'user-1', type: 'user', title: 'Account', settings: {} }
                        ]
                    },
                    bottom: { left: [], center: [], right: [] }
                });
            }
        } catch (error) { console.error(error); } finally { setLoading(false); }
    };

    const handleSave = async () => {
        try {
            setSaving(true);
            await api.patch('/layout/header', { structure: JSON.stringify(structure) });
            toast.success('Đã lưu cấu hình Header');
        } catch (error) { toast.error('Lưu thất bại'); } finally { setSaving(false); }
    };

    const findContainer = (id: string): { row: keyof HeaderStructure; col: keyof HeaderStructure['top'] } | null => {
        for (const row of ['top', 'main', 'bottom'] as const) {
            for (const col of ['left', 'center', 'right'] as const) {
                if (structure[row][col].some(b => b.id === id)) {
                    return { row, col };
                }
                if (`zone-${row}-${col}` === id) {
                    return { row, col };
                }
            }
        }
        return null;
    };

    const handleDragStart = (event: DragStartEvent) => {
        setActiveId(event.active.id as string);
    };

    const handleDragOver = (event: DragOverEvent) => {
        const { active, over } = event;
        if (!over) return;

        const activeId = active.id as string;
        const overId = over.id as string;

        const activeContainer = findContainer(activeId);
        const overContainer = findContainer(overId);

        if (!activeContainer || !overContainer || activeContainer.row === overContainer.row && activeContainer.col === overContainer.col) {
            return;
        }

        setStructure(prev => {
            const activeItems = prev[activeContainer.row][activeContainer.col];
            const overItems = prev[overContainer.row][overContainer.col];
            const activeIndex = activeItems.findIndex(i => i.id === activeId);

            const newStructure = JSON.parse(JSON.stringify(prev));
            const [movedItem] = newStructure[activeContainer.row][activeContainer.col].splice(activeIndex, 1);

            // If over is a container, add to end
            if (overId.startsWith('zone-')) {
                newStructure[overContainer.row][overContainer.col].push(movedItem);
            } else {
                const overIndex = overItems.findIndex(i => i.id === overId);
                newStructure[overContainer.row][overContainer.col].splice(overIndex >= 0 ? overIndex : 0, 0, movedItem);
            }

            return newStructure;
        });
    };

    const handleDragEnd = (event: DragEndEvent) => {
        const { active, over } = event;
        if (!over) {
            setActiveId(null);
            return;
        }

        const activeId = active.id as string;
        const overId = over.id as string;

        const activeContainer = findContainer(activeId);
        const overContainer = findContainer(overId);

        if (activeContainer && overContainer && activeContainer.row === overContainer.row && activeContainer.col === overContainer.col) {
            const activeIndex = structure[activeContainer.row][activeContainer.col].findIndex(i => i.id === activeId);
            const overIndex = structure[overContainer.row][overContainer.col].findIndex(i => i.id === overId);

            if (activeIndex !== overIndex) {
                setStructure(prev => {
                    const newItems = arrayMove(prev[activeContainer.row][activeContainer.col], activeIndex, overIndex);
                    return {
                        ...prev,
                        [activeContainer.row]: {
                            ...prev[activeContainer.row],
                            [activeContainer.col]: newItems
                        }
                    };
                });
            }
        }

        setActiveId(null);
    };

    const addBlock = (type: string, title: string) => {
        const newBlock: HeaderBlock = { id: `h-${Date.now()}`, type, title, settings: {} };
        // Default add to Main - Left
        setStructure(prev => ({
            ...prev,
            main: { ...prev.main, left: [...prev.main.left, newBlock] }
        }));
        toast.success(`Đã thêm ${title}`);
    };

    const deleteBlock = (id: string) => {
        const container = findContainer(id);
        if (container) {
            setStructure(prev => {
                const newItems = prev[container.row][container.col].filter(b => b.id !== id);
                return {
                    ...prev,
                    [container.row]: {
                        ...prev[container.row],
                        [container.col]: newItems
                    }
                };
            });
        }
    };

    const getActiveBlock = (): HeaderBlock | null => {
        if (!activeId) return null;
        for (const row of ['top', 'main', 'bottom'] as const) {
            for (const col of ['left', 'center', 'right'] as const) {
                const found = structure[row][col].find(b => b.id === activeId);
                if (found) return found;
            }
        }
        return null;
    };

    return (
        <div className="flex flex-col gap-6 animate-fade-in font-inter overflow-hidden h-[calc(100vh-120px)]">
            {/* Top Toolbar */}
            <div className="flex justify-between items-center bg-[#111114] p-4 rounded-2xl border border-white/10 shadow-xl shrink-0">
                <div>
                    <h1 className="text-2xl font-bold text-zinc-100 font-outfit uppercase">Header Builder</h1>
                    <p className="text-zinc-500 text-xs">Kéo thả các thành phần vào các vị trí Top, Main, hoặc Bottom của Header</p>
                </div>
                <div className="flex gap-4">
                    <button
                        onClick={handleSave}
                        disabled={saving}
                        className="flex items-center gap-2 px-6 py-2.5 bg-indigo-500 hover:bg-indigo-600 text-white rounded-xl text-sm font-bold shadow-lg shadow-indigo-500/20 transition-all active:scale-95 disabled:opacity-50"
                    >
                        <Save size={18} />
                        {saving ? 'Đang lưu...' : 'Lưu cấu hình'}
                    </button>
                </div>
            </div>

            <div className="flex gap-6 overflow-hidden flex-1">
                {/* Available Blocks Sidebar */}
                <div className="w-64 bg-[#111114] border border-white/10 rounded-2xl p-6 flex flex-col shrink-0">
                    <h2 className="text-sm font-black text-zinc-500 uppercase tracking-widest mb-6">Thành phần</h2>
                    <div className="space-y-3 overflow-y-auto pr-2 custom-scrollbar flex-1">
                        {AVAILABLE_BLOCKS.map(block => (
                            <button
                                key={block.type}
                                onClick={() => addBlock(block.type, block.title)}
                                className="w-full flex items-center gap-3 p-3 bg-white/[0.02] border border-white/5 rounded-xl hover:border-indigo-500/50 hover:bg-white/[0.05] transition-all group text-left"
                            >
                                <div className="w-8 h-8 rounded-lg bg-white/5 flex items-center justify-center text-zinc-500 group-hover:text-indigo-400 transition-colors shrink-0">
                                    {block.icon}
                                </div>
                                <span className="text-xs font-bold text-zinc-400 group-hover:text-white transition-colors">{block.title}</span>
                                <Plus size={14} className="ml-auto text-zinc-600 opacity-0 group-hover:opacity-100 transition-opacity" />
                            </button>
                        ))}
                    </div>
                </div>

                {/* Canvas Area */}
                <div className="flex-1 bg-[#0a0a0c] border border-white/10 rounded-2xl p-8 overflow-y-auto relative custom-scrollbar">
                    <div className="max-w-5xl mx-auto space-y-12">
                        <DndContext
                            sensors={sensors}
                            collisionDetection={rectIntersection}
                            onDragStart={handleDragStart}
                            onDragOver={handleDragOver}
                            onDragEnd={handleDragEnd}
                        >
                            {(['top', 'main', 'bottom'] as const).map(row => (
                                <div key={row} className="space-y-3 relative">
                                    <div className="flex items-center gap-4 mb-2">
                                        <div className="h-px flex-1 bg-white/5"></div>
                                        <span className="text-[10px] font-black uppercase tracking-[0.3em] text-zinc-600">{row} bar</span>
                                        <div className="h-px flex-1 bg-white/5"></div>
                                    </div>

                                    <div className={`
                                        flex gap-4 p-1.5 rounded-2xl bg-[#111114] border border-white/5 shadow-inner
                                        ${row === 'main' ? 'min-h-[100px] border-white/10' : 'min-h-[80px] opacity-80'}
                                    `}>
                                        {(['left', 'center', 'right'] as const).map(col => (
                                            <DroppableZone
                                                key={`${row}-${col}`}
                                                id={`zone-${row}-${col}`}
                                                blocks={structure[row][col]}
                                                label={col}
                                                onEdit={setEditingBlock}
                                                onDelete={deleteBlock}
                                            />
                                        ))}
                                    </div>
                                </div>
                            ))}

                            <DragOverlay>
                                {activeId && getActiveBlock() ? (
                                    <SortableBlock
                                        block={getActiveBlock()!}
                                        onEdit={() => { }}
                                        onDelete={() => { }}
                                        isOverlay
                                    />
                                ) : null}
                            </DragOverlay>
                        </DndContext>

                        {/* Visual Guide Text */}
                        <div className="p-8 border-2 border-dashed border-white/5 rounded-3xl flex flex-col items-center justify-center text-center gap-4 group">
                            <Layout size={40} className="text-zinc-800 group-hover:text-indigo-500/20 transition-colors" />
                            <div className="max-w-md">
                                <h3 className="text-sm font-bold text-zinc-600 uppercase tracking-widest mb-2">Cơ chế hiển thị</h3>
                                <p className="text-xs text-zinc-700 leading-relaxed font-medium italic">
                                    Thanh điều hướng sẽ được render theo từng hàng (Top, Main, Bottom).
                                    Trong mỗi hàng, các cột (Left, Center, Right) sẽ tự động căn chỉnh.
                                    Hàng nào không có thành phần sẽ không được hiển thị ở Frontend.
                                </p>
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            {/* Editing Modal */}
            {editingBlock && (
                <div className="fixed inset-0 bg-black/80 flex items-center justify-center z-50 p-4 animate-fade-in backdrop-blur-sm">
                    <div className="bg-[#111114] border border-white/10 rounded-3xl w-full max-w-md p-8 animate-zoom-in shadow-2xl">
                        <div className="flex items-center justify-between mb-8">
                            <div>
                                <h3 className="text-xl font-bold text-white font-outfit uppercase tracking-tight">Cấu hình Block</h3>
                                <p className="text-xs text-zinc-500 font-bold uppercase tracking-widest mt-1">Loại: {editingBlock.type}</p>
                            </div>
                            <button onClick={() => setEditingBlock(null)} className="text-zinc-500 hover:text-white transition-colors"><X size={24} /></button>
                        </div>

                        <div className="space-y-6">
                            <div>
                                <label className="block text-[10px] font-black text-zinc-500 uppercase tracking-widest mb-3 pl-1">Nhãn mô tả</label>
                                <input
                                    type="text"
                                    className="w-full bg-black/40 border border-white/10 rounded-2xl px-5 py-4 text-white focus:border-indigo-500 focus:ring-4 focus:ring-indigo-500/10 outline-none transition-all font-bold"
                                    value={editingBlock.title}
                                    onChange={e => setEditingBlock({ ...editingBlock, title: e.target.value })}
                                />
                            </div>

                            <div className="p-6 bg-white/[0.02] border border-white/5 rounded-3xl space-y-4">
                                <h4 className="text-[10px] font-black text-zinc-600 uppercase tracking-widest flex items-center gap-2">
                                    <Settings size={12} />
                                    Tùy chọn hiển thị
                                </h4>

                                <CustomCheckbox
                                    label="Ẩn trên di động"
                                    description="Không hiển thị thành phần này khi xem web bằng điện thoại"
                                    checked={editingBlock.settings?.hideOnMobile || false}
                                    onChange={val => setEditingBlock({ ...editingBlock, settings: { ...editingBlock.settings, hideOnMobile: val } })}
                                />

                                {editingBlock.type === 'logo' && (
                                    <div className="pt-2 space-y-4">
                                        <CustomCheckbox
                                            label="Sử dụng Logo từ Cấu hình chung"
                                            description="Nếu tắt, bạn có thể chọn một logo riêng cho Header này"
                                            checked={editingBlock.settings?.useGlobalLogo !== false}
                                            onChange={val => setEditingBlock({ ...editingBlock, settings: { ...editingBlock.settings, useGlobalLogo: val } })}
                                        />

                                        {editingBlock.settings?.useGlobalLogo === false && (
                                            <div className="space-y-3 pt-2">
                                                <label className="block text-[10px] font-black text-zinc-500 uppercase tracking-widest pl-1">Chọn Logo riêng</label>
                                                <button
                                                    onClick={() => setShowMediaPicker(true)}
                                                    className="w-full aspect-[3/1] bg-black/40 border border-dashed border-white/10 rounded-2xl overflow-hidden flex items-center justify-center group/logo hover:border-indigo-500/50 transition-all"
                                                >
                                                    {editingBlock.settings?.logoUrl ? (
                                                        <img src={editingBlock.settings.logoUrl} className="w-full h-full object-contain p-4" />
                                                    ) : (
                                                        <div className="flex flex-col items-center gap-2 text-zinc-500 group-hover/logo:text-indigo-400">
                                                            <ImageIcon size={24} />
                                                            <span className="text-[10px] font-bold uppercase tracking-wider">Chọn ảnh...</span>
                                                        </div>
                                                    )}
                                                </button>
                                            </div>
                                        )}
                                    </div>
                                )}

                                {editingBlock.type === 'menu' && (
                                    <div className="pt-2">
                                        <CustomSelect
                                            label="Chọn Menu hiển thị"
                                            value={editingBlock.settings?.menuId || ''}
                                            onChange={val => setEditingBlock({ ...editingBlock, settings: { ...editingBlock.settings, menuId: val } })}
                                            options={[
                                                { value: '', label: '-- Chọn Menu --' },
                                                ...menus.map(m => ({ value: m.id, label: m.name }))
                                            ]}
                                        />
                                    </div>
                                )}

                                {editingBlock.type === 'banner-slider' && (
                                    <div className="pt-2 space-y-4">
                                        <h4 className="text-[10px] font-black text-zinc-600 uppercase tracking-widest flex items-center gap-2">
                                            Danh sách Slides
                                        </h4>
                                        <div className="space-y-3">
                                            {(editingBlock.settings?.slides || []).map((slide: any, index: number) => (
                                                <div key={index} className="p-4 bg-black/40 border border-white/5 rounded-2xl relative group/slide">
                                                    <button
                                                        onClick={() => {
                                                            const newSlides = [...(editingBlock.settings?.slides || [])];
                                                            newSlides.splice(index, 1);
                                                            setEditingBlock({ ...editingBlock, settings: { ...editingBlock.settings, slides: newSlides } });
                                                        }}
                                                        className="absolute -top-2 -right-2 w-6 h-6 bg-red-500 text-white rounded-full flex items-center justify-center opacity-0 group-hover/slide:opacity-100 transition-opacity z-10"
                                                    >
                                                        <X size={12} />
                                                    </button>
                                                    <div className="flex gap-3">
                                                        <button
                                                            onClick={() => {
                                                                setActiveSlideIndex(index);
                                                                setShowMediaPicker(true);
                                                            }}
                                                            className="w-16 h-16 bg-white/5 rounded-lg overflow-hidden flex items-center justify-center shrink-0 border border-white/10 hover:border-indigo-500/50"
                                                        >
                                                            {slide.image ? <img src={slide.image} className="w-full h-full object-cover" /> : <Plus size={16} />}
                                                        </button>
                                                        <div className="flex-1 space-y-2">
                                                            <input
                                                                placeholder="Tiêu đề"
                                                                value={slide.title || ''}
                                                                onChange={e => {
                                                                    const newSlides = [...(editingBlock.settings?.slides || [])];
                                                                    newSlides[index].title = e.target.value;
                                                                    setEditingBlock({ ...editingBlock, settings: { ...editingBlock.settings, slides: newSlides } });
                                                                }}
                                                                className="w-full bg-transparent border-b border-white/10 text-xs text-white focus:border-indigo-500 outline-none pb-1"
                                                            />
                                                            <input
                                                                placeholder="Link"
                                                                value={slide.link || ''}
                                                                onChange={e => {
                                                                    const newSlides = [...(editingBlock.settings?.slides || [])];
                                                                    newSlides[index].link = e.target.value;
                                                                    setEditingBlock({ ...editingBlock, settings: { ...editingBlock.settings, slides: newSlides } });
                                                                }}
                                                                className="w-full bg-transparent border-b border-white/10 text-[10px] text-zinc-500 focus:border-indigo-500 outline-none pb-1"
                                                            />
                                                        </div>
                                                    </div>
                                                </div>
                                            ))}
                                            <button
                                                onClick={() => {
                                                    const newSlides = [...(editingBlock.settings?.slides || []), { title: '', link: '', image: '' }];
                                                    setEditingBlock({ ...editingBlock, settings: { ...editingBlock.settings, slides: newSlides } });
                                                }}
                                                className="w-full py-2 border border-dashed border-white/10 rounded-xl text-xs text-zinc-500 hover:text-white hover:border-white/20 transition-all flex items-center justify-center gap-2"
                                            >
                                                <Plus size={14} /> Thêm slide
                                            </button>
                                        </div>
                                    </div>
                                )}
                            </div>
                        </div>

                        <div className="mt-10 flex gap-4">
                            <button onClick={() => setEditingBlock(null)} className="flex-1 py-4 bg-white/5 text-zinc-400 hover:bg-white/10 rounded-2xl font-bold transition-all">Đóng</button>
                            <button
                                onClick={() => {
                                    setStructure(prev => {
                                        const container = findContainer(editingBlock.id);
                                        if (!container) return prev;
                                        const newItems = prev[container.row][container.col].map(b => b.id === editingBlock.id ? editingBlock : b);
                                        return { ...prev, [container.row]: { ...prev[container.row], [container.col]: newItems } };
                                    });
                                    setEditingBlock(null);
                                    toast.success('Đã cập nhật cấu hình');
                                }}
                                className="flex-1 py-4 bg-indigo-500 hover:bg-indigo-600 text-white rounded-2xl font-bold shadow-xl shadow-indigo-500/20 active:scale-[0.98] transition-all"
                            >
                                Áp dụng
                            </button>
                        </div>
                    </div>
                </div>
            )}

            <MediaPickerModal
                isOpen={showMediaPicker}
                onClose={() => {
                    setShowMediaPicker(false);
                    setActiveSlideIndex(null);
                }}
                onSelect={(url) => {
                    if (activeSlideIndex !== null && editingBlock) {
                        const newSlides = [...(editingBlock.settings?.slides || [])];
                        newSlides[activeSlideIndex].image = url;
                        setEditingBlock({ ...editingBlock, settings: { ...editingBlock.settings, slides: newSlides } });
                    } else if (editingBlock && editingBlock.type === 'logo') {
                        setEditingBlock({ ...editingBlock, settings: { ...editingBlock.settings, logoUrl: url } });
                    }
                    setShowMediaPicker(false);
                    setActiveSlideIndex(null);
                }}
            />
        </div>
    );
};

export default HeaderBuilder;
