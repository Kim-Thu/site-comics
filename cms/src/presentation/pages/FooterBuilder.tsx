import {
    DndContext,
    DragEndEvent,
    DragOverEvent,
    DragOverlay,
    DragStartEvent,
    PointerSensor,
    pointerWithin,
    rectIntersection,
    useSensor,
    useSensors
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
import CustomCheckbox from '../components/atoms/CustomCheckbox';
import CustomSelect from '../components/atoms/CustomSelect';
import MediaPickerModal from '../components/MediaPickerModal';

interface FooterBlock {
    id: string;
    type: string;
    title: string;
    settings: any;
    children?: FooterBlock[];
}

interface FooterStructure {
    layout: 'columns' | 'centered';
    top: FooterBlock[];
    topSettings?: { align: 'start' | 'center' | 'end' | 'between'; direction: 'row' | 'col' };
    main: {
        col1: FooterBlock[];
        col2: FooterBlock[];
        col3: FooterBlock[];
        col4: FooterBlock[];
    };
    mainSettings?: { columns: number };
    bottom: FooterBlock[];
    bottomSettings?: { align: 'start' | 'center' | 'end' | 'between' };
}

const AVAILABLE_BLOCKS = [
    { type: 'container', title: 'Cột / Khung chứa', icon: <Columns size={18} /> },
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
                flex flex-col gap-2 bg-[#1a1a1d] border border-white/10 rounded-2xl p-1 transition-all group relative
                ${isOverlay ? 'shadow-2xl border-indigo-500 scale-105 bg-[#252529] z-[100]' : 'hover:border-indigo-500/50'}
            `}
        >
            <div className="flex items-center gap-3 py-2 px-3">
                <div {...attributes} {...listeners} className="cursor-grab active:cursor-grabbing text-zinc-600 hover:text-white transition-colors">
                    <GripHorizontal size={16} />
                </div>

                <div className="w-8 h-8 rounded-lg bg-white/5 flex items-center justify-center text-indigo-400 shrink-0">
                    {block.type === 'container' && <Columns size={16} />}
                    {block.type === 'about' && <Info size={16} />}
                    {block.type === 'menu' && <Layout size={16} />}
                    {block.type === 'contact' && <Phone size={16} />}
                    {block.type === 'newsletter' && <Mail size={16} />}
                    {block.type === 'social' && <Facebook size={16} />}
                    {block.type === 'copyright' && <Copyright size={16} />}
                    {block.type === 'text' && <Type size={16} />}
                </div>

                <div className="flex-1 min-w-0">
                    <div className="text-[11px] font-bold text-zinc-200 truncate">{block.title || 'Untitled Block'}</div>
                </div>

                <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                    <button onClick={(e) => { e.stopPropagation(); onEdit(block); }} className="p-1.5 text-zinc-500 hover:text-indigo-400 hover:bg-white/5 rounded-lg transition-all">
                        <Settings size={14} />
                    </button>
                    <button onClick={(e) => { e.stopPropagation(); onDelete(block.id); }} className="p-1.5 text-zinc-500 hover:text-red-400 hover:bg-white/5 rounded-lg transition-all">
                        <Trash2 size={14} />
                    </button>
                </div>
            </div>

            {block.type === 'container' && !isOverlay && (
                <div className="px-2 pb-2">
                    <div className="grid gap-3" style={{ gridTemplateColumns: `repeat(${block.settings?.columns || 1}, minmax(0, 1fr))` }}>
                        {Array.from({ length: block.settings?.columns || 1 }).map((_, idx) => (
                            <DroppableZone
                                key={idx}
                                id={`nested-zone-${block.id}-col-${idx + 1}`}
                                blocks={block.settings?.columnsData?.[`col${idx + 1}`] || []}
                                label={`Cột ${idx + 1}`}
                                onEdit={onEdit}
                                onDelete={onDelete}
                                isNested
                            />
                        ))}
                    </div>
                </div>
            )}
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
    isNested?: boolean;
}> = ({ id, blocks, label, onEdit, onDelete, horizontal = false, isNested = false }) => {
    const { setNodeRef } = useDroppable({ id });

    return (
        <div ref={setNodeRef} className={`w-full flex-1 flex flex-col ${isNested ? 'min-h-[60px]' : 'min-h-[140px]'} relative group/zone`}>
            <div className="absolute top-2 left-4 text-[9px] font-black uppercase tracking-widest text-zinc-700 pointer-events-none group-hover/zone:text-zinc-500 transition-colors z-0">
                {label}
            </div>
            <div className={`
                flex-1 bg-white/${isNested ? '[0.02]' : '[0.01]'} border-2 border-dashed border-white/5 rounded-3xl ${isNested ? 'p-3' : 'p-6'} transition-all group-hover/zone:bg-white/[0.03] group-hover/zone:border-white/10
                flex ${horizontal ? 'flex-row flex-wrap items-center justify-center' : 'flex-col'} gap-3
            `}>
                <SortableContext items={blocks.map(b => b.id)} strategy={horizontal ? horizontalListSortingStrategy : verticalListSortingStrategy}>
                    {blocks.map(block => (
                        <div key={block.id} className={horizontal ? 'min-w-[200px]' : 'w-full'}>
                            <SortableBlock block={block} onEdit={onEdit} onDelete={onDelete} />
                        </div>
                    ))}
                </SortableContext>
                {blocks.length === 0 && (
                    <div className="flex-1 flex items-center justify-center">
                        <span className="text-[10px] font-black text-zinc-800 uppercase tracking-[0.3em]">Kéo thả vào đây</span>
                    </div>
                )}
            </div>
        </div>
    );
};

import { useDroppable } from '@dnd-kit/core';

const FooterBuilder = () => {
    const [structure, setStructure] = useState<FooterStructure>({
        layout: 'columns',
        top: [],
        main: { col1: [], col2: [], col3: [], col4: [] },
        bottom: []
    });
    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);
    const [activeId, setActiveId] = useState<string | null>(null);
    const [editingBlock, setEditingBlock] = useState<FooterBlock | null>(null);
    const [activeBlockTab, setActiveBlockTab] = useState<'content' | 'style'>('content');
    const [menus, setMenus] = useState<any[]>([]);
    const [showMediaPicker, setShowMediaPicker] = useState(false);

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
                setStructure(JSON.parse(data.structure));
            }
        } catch (error) { console.error(error); } finally { setLoading(false); }
    };

    const handleSave = async () => {
        try {
            setSaving(true);
            await api.patch('/layout/footer', { structure: JSON.stringify(structure) });
            toast.success('Đã lưu giao diện Footer');
        } catch (error) { toast.error('Lưu thất bại'); } finally { setSaving(false); }
    };

    const findContainer = (id: string): { area: 'top' | 'main' | 'bottom' | 'nested'; key?: keyof FooterStructure['main']; parentId?: string; colKey?: string } | null => {
        // Check top-level containers
        if (structure.top.some(b => b.id === id) || id === 'zone-top') return { area: 'top' };
        if (structure.bottom.some(b => b.id === id) || id === 'zone-bottom') return { area: 'bottom' };
        for (const key of ['col1', 'col2', 'col3', 'col4'] as const) {
            if (structure.main[key].some(b => b.id === id) || id === `zone-main-${key}`) return { area: 'main', key };
        }

        // Check specifically for nested column zones: nested-zone-${parentId}-col-${colIndex}
        if (id.startsWith('nested-zone-')) {
            const parts = id.split('-col-');
            const parentId = parts[0].replace('nested-zone-', '');
            const colIndex = parts[1];
            const colKey = `col${colIndex}`;

            const findBlockArea = (blocks: FooterBlock[]): { area: any, key?: any } | null => {
                for (const b of blocks) {
                    if (b.id === parentId) return { area: 'nested' };
                    // Search in columnsData of nested containers
                    if (b.settings?.columnsData) {
                        for (const ck of Object.keys(b.settings.columnsData)) {
                            const found = findBlockArea(b.settings.columnsData[ck]);
                            if (found) return found;
                        }
                    }
                }
                return null;
            };

            if (findBlockArea(structure.top)) return { area: 'nested', parentId, colKey };
            if (findBlockArea(structure.bottom)) return { area: 'nested', parentId, colKey };
            for (const key of ['col1', 'col2', 'col3', 'col4'] as const) {
                if (findBlockArea(structure.main[key])) return { area: 'nested', key, parentId, colKey };
            }
        }

        // Check if ID is a block inside a nested column
        const findNestedParent = (blocks: FooterBlock[]): { parentId: string, colKey: string } | null => {
            for (const b of blocks) {
                if (b.settings?.columnsData) {
                    for (const colKey of Object.keys(b.settings.columnsData)) {
                        if (b.settings.columnsData[colKey].some((c: any) => c.id === id)) return { parentId: b.id, colKey };
                        const found = findNestedParent(b.settings.columnsData[colKey]);
                        if (found) return found;
                    }
                }
            }
            return null;
        };

        const resInTop = findNestedParent(structure.top);
        if (resInTop) return { area: 'nested', parentId: resInTop.parentId, colKey: resInTop.colKey };

        const resInBottom = findNestedParent(structure.bottom);
        if (resInBottom) return { area: 'nested', parentId: resInBottom.parentId, colKey: resInBottom.colKey };

        for (const key of ['col1', 'col2', 'col3', 'col4'] as const) {
            const resInMain = findNestedParent(structure.main[key]);
            if (resInMain) return { area: 'nested', key, parentId: resInMain.parentId, colKey: resInMain.colKey };
        }

        return null;
    };

    const getBlockById = (id: string, blocks: FooterBlock[]): FooterBlock | null => {
        for (const b of blocks) {
            if (b.id === id) return b;
            if (b.settings?.columnsData) {
                for (const colKey of Object.keys(b.settings.columnsData)) {
                    const found = getBlockById(id, b.settings.columnsData[colKey]);
                    if (found) return found;
                }
            }
        }
        return null;
    };

    const removeBlockById = (id: string, blocks: FooterBlock[]): FooterBlock[] => {
        return blocks.filter(b => b.id !== id).map(b => {
            if (b.settings?.columnsData) {
                const newColumnsData = { ...b.settings.columnsData };
                for (const colKey of Object.keys(newColumnsData)) {
                    newColumnsData[colKey] = removeBlockById(id, newColumnsData[colKey]);
                }
                return { ...b, settings: { ...b.settings, columnsData: newColumnsData } };
            }
            return b;
        });
    };

    const addBlockToNested = (parentId: string, colKey: string, block: FooterBlock, blocks: FooterBlock[]): FooterBlock[] => {
        return blocks.map(b => {
            if (b.id === parentId) {
                const columnsData = b.settings?.columnsData || {};
                const currentBlocks = columnsData[colKey] || [];
                return { ...b, settings: { ...b.settings, columnsData: { ...columnsData, [colKey]: [...currentBlocks, block] } } };
            }
            if (b.settings?.columnsData) {
                const newColumnsData = { ...b.settings.columnsData };
                for (const ck of Object.keys(newColumnsData)) {
                    newColumnsData[ck] = addBlockToNested(parentId, colKey, block, newColumnsData[ck]);
                }
                return { ...b, settings: { ...b.settings, columnsData: newColumnsData } };
            }
            return b;
        });
    };

    const handleDragStart = (e: DragStartEvent) => setActiveId(e.active.id as string);

    const handleDragOver = (e: DragOverEvent) => {
        const { active, over } = e;
        if (!over) return;
        const activeId = active.id as string;
        const overId = over.id as string;
        const activeC = findContainer(activeId);
        const overC = findContainer(overId);
        if (!activeC || !overC || (activeC.area === overC.area && activeC.key === overC.key)) return;

        setStructure(prev => {
            let movedBlock: FooterBlock | null = null;
            const areas = ['top', 'bottom'] as const;
            for (const area of areas) {
                const found = getBlockById(activeId, prev[area]);
                if (found) { movedBlock = found; break; }
            }
            if (!movedBlock) {
                for (const key of ['col1', 'col2', 'col3', 'col4'] as const) {
                    const found = getBlockById(activeId, prev.main[key]);
                    if (found) { movedBlock = found; break; }
                }
            }

            if (!movedBlock) return prev;

            let newStructure = JSON.parse(JSON.stringify(prev));
            // Remove from old place
            newStructure.top = removeBlockById(activeId, newStructure.top);
            newStructure.bottom = removeBlockById(activeId, newStructure.bottom);
            for (const key of ['col1', 'col2', 'col3', 'col4'] as const) {
                newStructure.main[key] = removeBlockById(activeId, newStructure.main[key]);
            }

            // Add to new place
            if (overC.area === 'top') {
                newStructure.top.push(movedBlock);
            } else if (overC.area === 'main') {
                newStructure.main[overC.key!].push(movedBlock);
            } else if (overC.area === 'bottom') {
                newStructure.bottom.push(movedBlock);
            } else if (overC.area === 'nested') {
                if (movedBlock.id === overC.parentId) return prev; // Cannot move into itself
                newStructure.top = addBlockToNested(overC.parentId!, overC.colKey!, movedBlock, newStructure.top);
                newStructure.bottom = addBlockToNested(overC.parentId!, overC.colKey!, movedBlock, newStructure.bottom);
                for (const key of ['col1', 'col2', 'col3', 'col4'] as const) {
                    newStructure.main[key] = addBlockToNested(overC.parentId!, overC.colKey!, movedBlock, newStructure.main[key]);
                }
            }
            return newStructure;
        });
    };

    const handleDragEnd = (e: DragEndEvent) => {
        const { active, over } = e;
        if (over && active.id !== over.id) {
            const activeId = active.id as string;
            const overId = over.id as string;
            const activeC = findContainer(activeId);
            const overC = findContainer(overId);

            if (activeC && overC && activeC.area === overC.area && activeC.key === overC.key && activeC.parentId === overC.parentId && activeC.colKey === overC.colKey) {
                setStructure(prev => {
                    const newStructure = JSON.parse(JSON.stringify(prev));
                    const reorder = (blocks: FooterBlock[]): FooterBlock[] => {
                        const oldIdx = blocks.findIndex(b => b.id === activeId);
                        const newIdx = blocks.findIndex(b => b.id === overId);
                        if (oldIdx !== -1 && newIdx !== -1) {
                            return arrayMove(blocks, oldIdx, newIdx);
                        }
                        return blocks.map(b => {
                            if (b.settings?.columnsData) {
                                const newCD = { ...b.settings.columnsData };
                                for (const ck of Object.keys(newCD)) {
                                    newCD[ck] = reorder(newCD[ck]);
                                }
                                return { ...b, settings: { ...b.settings, columnsData: newCD } };
                            }
                            return b;
                        });
                    };

                    if (activeC.area === 'top') newStructure.top = reorder(newStructure.top);
                    else if (activeC.area === 'bottom') newStructure.bottom = reorder(newStructure.bottom);
                    else if (activeC.area === 'main') {
                        newStructure.main[activeC.key!] = reorder(newStructure.main[activeC.key!]);
                    } else if (activeC.area === 'nested') {
                        newStructure.top = reorder(newStructure.top);
                        newStructure.bottom = reorder(newStructure.bottom);
                        for (const key of ['col1', 'col2', 'col3', 'col4'] as const) {
                            newStructure.main[key] = reorder(newStructure.main[key]);
                        }
                    }
                    return newStructure;
                });
            }
        }
        setActiveId(null);
    };

    const addBlock = (type: string, title: string) => {
        const newBlock = { id: `block-${Date.now()}`, type, title, settings: {} };
        setStructure(prev => ({
            ...prev,
            main: { ...prev.main, col1: [...prev.main.col1, newBlock] }
        }));
    };

    const deleteBlock = (id: string) => {
        setStructure(prev => ({
            ...prev,
            top: removeBlockById(id, prev.top),
            bottom: removeBlockById(id, prev.bottom),
            main: {
                col1: removeBlockById(id, prev.main.col1),
                col2: removeBlockById(id, prev.main.col2),
                col3: removeBlockById(id, prev.main.col3),
                col4: removeBlockById(id, prev.main.col4),
            }
        }));
    };

    const activeBlock = activeId ? (
        getBlockById(activeId, structure.top) ||
        getBlockById(activeId, [...structure.main.col1, ...structure.main.col2, ...structure.main.col3, ...structure.main.col4]) ||
        getBlockById(activeId, structure.bottom)
    ) : null;

    if (loading) return null;

    return (
        <div className="flex flex-col gap-6 animate-fade-in font-inter h-[calc(100vh-120px)] overflow-hidden">
            <div className="flex justify-between items-center bg-[#111114] p-4 rounded-2xl border border-white/10 shadow-xl shrink-0">
                <div>
                    <h1 className="text-2xl font-bold text-zinc-100 font-outfit uppercase tracking-tight">Footer Builder</h1>
                    <p className="text-zinc-500 text-xs font-medium">Thiết lập cấu trúc chân trang chuyên nghiệp</p>
                </div>
                <div className="flex items-center gap-4">
                    <div className="flex bg-black/40 p-1 rounded-xl border border-white/5">
                        <button onClick={() => setStructure({ ...structure, layout: 'columns' })} className={`flex items-center gap-2 px-4 py-2 rounded-lg text-xs font-bold transition-all ${structure.layout === 'columns' ? 'bg-indigo-500 text-white shadow-lg' : 'text-zinc-500 hover:text-zinc-300'}`}><Columns size={14} /> Cột</button>
                        <button onClick={() => setStructure({ ...structure, layout: 'centered' })} className={`flex items-center gap-2 px-4 py-2 rounded-lg text-xs font-bold transition-all ${structure.layout === 'centered' ? 'bg-indigo-500 text-white shadow-lg' : 'text-zinc-500 hover:text-zinc-300'}`}><Layout size={14} /> Căn giữa</button>
                    </div>

                    {structure.layout === 'columns' && (
                        <div className="flex items-center bg-black/40 p-1 rounded-xl border border-white/5 gap-1">
                            {[1, 2, 3, 4].map(num => (
                                <button
                                    key={num}
                                    onClick={() => setStructure({ ...structure, mainSettings: { ...structure.mainSettings, columns: num } })}
                                    className={`w-8 h-8 flex items-center justify-center rounded-lg text-[10px] font-black transition-all ${(structure.mainSettings?.columns || 4) === num ? 'bg-indigo-500 text-white' : 'text-zinc-600 hover:text-zinc-300'}`}
                                >
                                    {num}
                                </button>
                            ))}
                            <span className="text-[8px] font-black text-zinc-700 uppercase px-2">Cột</span>
                        </div>
                    )}
                    <button onClick={handleSave} disabled={saving} className="flex items-center gap-2 px-6 py-2.5 bg-indigo-500 hover:bg-indigo-600 text-white rounded-xl text-sm font-bold shadow-lg transition-all disabled:opacity-50"><Save size={18} /> {saving ? 'Lưu...' : 'Lưu giao diện'}</button>
                </div>
            </div>

            <div className="flex gap-6 overflow-hidden flex-1">
                <div className="w-64 bg-[#111114] border border-white/10 rounded-2xl p-6 flex flex-col shrink-0">
                    <h2 className="text-[10px] font-black text-zinc-600 uppercase tracking-widest mb-6">Thành phần Footer</h2>
                    <div className="space-y-2 overflow-y-auto pr-2 flex-1 custom-scrollbar">
                        {AVAILABLE_BLOCKS.map(block => (
                            <button key={block.type} onClick={() => addBlock(block.type, block.title)} className="w-full flex items-center gap-3 p-3 bg-white/[0.01] border border-white/5 rounded-xl hover:border-indigo-500/50 hover:bg-white/[0.03] transition-all group text-left">
                                <div className="w-8 h-8 rounded-lg bg-white/5 flex items-center justify-center text-zinc-500 group-hover:text-indigo-400 transition-colors">{block.icon}</div>
                                <span className="text-[11px] font-bold text-zinc-500 group-hover:text-zinc-300">{block.title}</span>
                                <Plus size={14} className="ml-auto text-zinc-600 opacity-0 group-hover:opacity-100" />
                            </button>
                        ))}
                    </div>
                </div>

                <div className="flex-1 bg-[#070708] border border-white/10 rounded-2xl p-10 overflow-y-auto relative custom-scrollbar">
                    <div className="max-w-5xl mx-auto space-y-12 pb-20">
                        <DndContext
                            sensors={sensors}
                            collisionDetection={(args) => {
                                // Prefer nested droppable zones if they are under the pointer
                                const pointerCollisions = pointerWithin(args);
                                if (pointerCollisions.length > 0) {
                                    const nested = pointerCollisions.find(c => String(c.id).startsWith('nested-zone-'));
                                    if (nested) return [nested];
                                    return pointerCollisions;
                                }
                                return rectIntersection(args);
                            }}
                            onDragStart={handleDragStart}
                            onDragOver={handleDragOver}
                            onDragEnd={handleDragEnd}
                        >
                            <div className="space-y-4">
                                <div className="flex items-center justify-between gap-4">
                                    <div className="flex items-center gap-4 opacity-30 flex-1">
                                        <span className="text-[10px] font-black uppercase tracking-widest text-zinc-500">Footer Top Area</span>
                                        <div className="h-px flex-1 bg-zinc-800"></div>
                                    </div>
                                    <div className="flex items-center gap-2 bg-white/5 p-1 rounded-lg border border-white/10">
                                        <CustomSelect value={structure.topSettings?.align || 'between'} onChange={val => setStructure({ ...structure, topSettings: { ...structure.topSettings!, align: val as any } })} options={[{ value: 'start', label: 'Align Left' }, { value: 'center', label: 'Align Center' }, { value: 'end', label: 'Align Right' }, { value: 'between', label: 'Space Between' }]} minimal />
                                        <div className="w-px h-3 bg-white/10 mx-1"></div>
                                        <CustomSelect value={structure.topSettings?.direction || 'row'} onChange={val => setStructure({ ...structure, topSettings: { ...structure.topSettings!, direction: val as any } })} options={[{ value: 'row', label: 'Row (Ngang)' }, { value: 'col', label: 'Column (Dọc)' }]} minimal />
                                    </div>
                                </div>
                                <DroppableZone id="zone-top" blocks={structure.top} label="Top Section" onEdit={setEditingBlock} onDelete={deleteBlock} horizontal />
                            </div>

                            <div className="space-y-4 pt-10 border-t border-white/5">
                                <div className="flex items-center justify-between gap-4">
                                    <div className="flex items-center gap-4 opacity-30 flex-1">
                                        <span className="text-[10px] font-black uppercase tracking-widest text-zinc-500">Footer Main Content</span>
                                        <div className="h-px flex-1 bg-zinc-800"></div>
                                    </div>
                                    {structure.layout === 'columns' && (
                                        <div className="flex items-center gap-2 bg-white/5 p-1 rounded-lg border border-white/10">
                                            <span className="text-[10px] font-bold text-zinc-500 px-2 uppercase">Cột:</span>
                                            <CustomSelect value={String(structure.mainSettings?.columns || 4)} onChange={val => setStructure({ ...structure, mainSettings: { ...structure.mainSettings!, columns: Number(val) } })} options={[{ value: '1', label: '1 Cột' }, { value: '2', label: '2 Cột' }, { value: '3', label: '3 Cột' }, { value: '4', label: '4 Cột' }]} minimal />
                                        </div>
                                    )}
                                </div>
                                <div className={`flex gap-6 w-full ${structure.layout === 'centered' ? 'flex-col' : 'flex-row'}`}>
                                    {structure.layout === 'columns' ? (
                                        (['col1', 'col2', 'col3', 'col4'] as const).slice(0, structure.mainSettings?.columns || 4).map(col => (
                                            <DroppableZone key={col} id={`zone-main-${col}`} blocks={structure.main[col]} label={`Cột ${col.slice(-1)}`} onEdit={setEditingBlock} onDelete={deleteBlock} />
                                        ))
                                    ) : (
                                        <DroppableZone id={`zone-main-col1`} blocks={structure.main.col1} label="Nội dung chính (Centered)" onEdit={setEditingBlock} onDelete={deleteBlock} />
                                    )}
                                </div>
                            </div>

                            <div className="space-y-4 pt-10 border-t border-white/5">
                                <div className="flex items-center justify-between gap-4">
                                    <div className="flex items-center gap-4 opacity-30 flex-1">
                                        <span className="text-[10px] font-black uppercase tracking-widest text-zinc-500">Footer Bottom Bar</span>
                                        <div className="h-px flex-1 bg-zinc-800"></div>
                                    </div>
                                    <div className="flex items-center bg-white/5 p-1 rounded-lg border border-white/10">
                                        <CustomSelect value={structure.bottomSettings?.align || 'between'} onChange={val => setStructure({ ...structure, bottomSettings: { ...structure.bottomSettings!, align: val as any } })} options={[{ value: 'start', label: 'Align Left' }, { value: 'center', label: 'Align Center' }, { value: 'end', label: 'Align Right' }, { value: 'between', label: 'Space Between' }]} minimal />
                                    </div>
                                </div>
                                <DroppableZone id="zone-bottom" blocks={structure.bottom} label="Copyright & Cùng cấp" onEdit={setEditingBlock} onDelete={deleteBlock} horizontal />
                            </div>

                            <DragOverlay>
                                {activeId && activeBlock ? <SortableBlock block={activeBlock} onEdit={() => { }} onDelete={() => { }} isOverlay /> : null}
                            </DragOverlay>
                        </DndContext>
                    </div>
                </div>
            </div>

            {editingBlock && (
                <div className="fixed inset-0 bg-black/90 flex items-center justify-center z-[100] p-4 animate-fade-in backdrop-blur-md">
                    <div className="bg-[#111114] border border-white/10 rounded-3xl w-full max-w-md animate-zoom-in shadow-2xl overflow-hidden flex flex-col max-h-[90vh]">
                        <div className="p-8 border-b border-white/5">
                            <div className="flex items-center justify-between mb-8">
                                <h3 className="text-xl font-bold text-white font-outfit uppercase tracking-tight underline underline-offset-8 decoration-indigo-500 decoration-2">Thiết lập Block</h3>
                                <button onClick={() => setEditingBlock(null)} className="text-zinc-500 hover:text-white transition-colors"><X size={24} /></button>
                            </div>
                            <div className="flex gap-2 p-1 bg-black/40 border border-white/10 rounded-2xl">
                                <button onClick={() => setActiveBlockTab('content')} className={`flex-1 flex items-center justify-center gap-2 py-3 rounded-xl text-xs font-bold transition-all ${activeBlockTab === 'content' ? 'bg-indigo-500 text-white shadow-lg' : 'text-zinc-500 hover:text-white'}`}><Type size={14} /> NỘI DUNG</button>
                                <button onClick={() => setActiveBlockTab('style')} className={`flex-1 flex items-center justify-center gap-2 py-3 rounded-xl text-xs font-bold transition-all ${activeBlockTab === 'style' ? 'bg-indigo-500 text-white shadow-lg' : 'text-zinc-500 hover:text-white'}`}><Layout size={14} /> GIAO DIỆN</button>
                            </div>
                        </div>

                        <div className="p-8 overflow-y-auto flex-1 custom-scrollbar">
                            {activeBlockTab === 'content' ? (
                                <div className="space-y-6 animate-in fade-in slide-in-from-bottom-2 duration-300">
                                    <div>
                                        <label className="block text-[10px] font-black text-zinc-500 uppercase tracking-widest mb-3 pl-1">Tiêu đề hiển thị</label>
                                        <input type="text" className="w-full bg-black/40 border border-white/10 rounded-2xl px-5 py-4 text-white focus:border-indigo-500 outline-none transition-all font-bold" placeholder="Ví dụ: VỀ CHÚNG TÔI" value={editingBlock.title} onChange={e => setEditingBlock({ ...editingBlock, title: e.target.value })} />
                                        <p className="text-[10px] text-zinc-600 mt-2 pl-1 italic">Để trống nếu không muốn hiển thị tiêu đề</p>
                                    </div>

                                    <div className="p-6 bg-white/[0.01] border border-white/5 rounded-3xl space-y-5">
                                        {editingBlock.type === 'container' && (
                                            <div className="space-y-6">
                                                <div className="p-5 bg-indigo-500/5 border border-indigo-500/10 rounded-3xl space-y-5 text-left">
                                                    <div className="flex items-center justify-between">
                                                        <div className="flex items-center gap-2 text-[10px] font-black text-indigo-400 uppercase tracking-widest">
                                                            <Columns size={12} /> Số lượng cột muốn chia
                                                        </div>
                                                        <span className="text-[10px] font-black text-zinc-500 bg-black/40 px-3 py-1 rounded-full border border-white/5">{editingBlock.settings?.columns || 2} Cột</span>
                                                    </div>

                                                    <div className="grid grid-cols-5 gap-2">
                                                        {[2, 3, 4, 5, 6].map(num => (
                                                            <button
                                                                key={num}
                                                                onClick={() => {
                                                                    const newData = { ...(editingBlock.settings?.columnsData || {}) };
                                                                    for (let i = 1; i <= num; i++) if (!newData[`col${i}`]) newData[`col${i}`] = [];
                                                                    setEditingBlock({
                                                                        ...editingBlock,
                                                                        settings: {
                                                                            ...editingBlock.settings,
                                                                            direction: 'row',
                                                                            columns: num,
                                                                            columnsData: newData
                                                                        }
                                                                    });
                                                                }}
                                                                className={`h-12 flex items-center justify-center rounded-xl text-xs font-black transition-all border ${(editingBlock.settings?.columns || 2) === num ? 'bg-indigo-500 border-indigo-500 text-white shadow-lg shadow-indigo-500/20 scale-105' : 'bg-black/40 border-white/5 text-zinc-500 hover:border-white/10'}`}
                                                            >
                                                                {num}
                                                            </button>
                                                        ))}
                                                    </div>
                                                    <p className="text-[10px] text-zinc-600 italic text-center">Hệ thống sẽ chia thành {editingBlock.settings?.columns || 2} vùng kéo thả riêng biệt</p>
                                                </div>

                                                <div className="grid grid-cols-3 gap-4 text-left">
                                                    <div className="space-y-2">
                                                        <label className="block text-[10px] font-black text-zinc-500 uppercase tracking-widest pl-1">Gap</label>
                                                        <input type="number" className="w-full bg-black/40 border border-white/10 rounded-2xl px-5 py-4 text-white text-sm outline-none focus:border-indigo-500/50" value={editingBlock.settings?.gap || 16} onChange={e => setEditingBlock({ ...editingBlock, settings: { ...editingBlock.settings, gap: Number(e.target.value) } })} />
                                                    </div>
                                                    <div className="space-y-2">
                                                        <label className="block text-[10px] font-black text-zinc-500 uppercase tracking-widest pl-1">Padding</label>
                                                        <input type="number" className="w-full bg-black/40 border border-white/10 rounded-2xl px-5 py-4 text-white text-sm outline-none focus:border-indigo-500/50" value={editingBlock.settings?.padding || 0} onChange={e => setEditingBlock({ ...editingBlock, settings: { ...editingBlock.settings, padding: Number(e.target.value) } })} />
                                                    </div>
                                                    <div className="space-y-2">
                                                        <label className="block text-[10px] font-black text-zinc-500 uppercase tracking-widest pl-1">Margin</label>
                                                        <input type="number" className="w-full bg-black/40 border border-white/10 rounded-2xl px-5 py-4 text-white text-sm outline-none focus:border-indigo-500/50" value={editingBlock.settings?.margin || 0} onChange={e => setEditingBlock({ ...editingBlock, settings: { ...editingBlock.settings, margin: Number(e.target.value) } })} />
                                                    </div>
                                                </div>
                                            </div>
                                        )}
                                    </div>
                                </div>
                            ) : (
                                <div className="space-y-6 animate-in fade-in slide-in-from-top-2 duration-300">
                                    <div className="space-y-4">
                                        <CustomCheckbox label="Ẩn trên di động" description="Không hiển thị trên điện thoại" checked={editingBlock.settings?.hideOnMobile || false} onChange={val => setEditingBlock({ ...editingBlock, settings: { ...editingBlock.settings, hideOnMobile: val } })} />
                                        <div>
                                            <label className="block text-[10px] font-black text-zinc-500 uppercase tracking-widest pl-1 mb-3">Căn lề (Alignment)</label>
                                            <div className="flex p-1.5 bg-black/40 border border-white/10 rounded-2xl">
                                                {(['left', 'center', 'right'] as const).map(align => (
                                                    <button key={align} onClick={() => setEditingBlock({ ...editingBlock, settings: { ...editingBlock.settings, align } })} className={`flex-1 py-3 text-[10px] font-black uppercase tracking-widest rounded-xl transition-all ${(editingBlock.settings?.align || 'left') === align ? 'bg-indigo-500 text-white shadow-lg' : 'text-zinc-500 hover:text-zinc-300'}`}>{align}</button>
                                                ))}
                                            </div>
                                        </div>
                                        <div className="grid grid-cols-2 gap-4">
                                            <div className="space-y-3">
                                                <label className="block text-[10px] font-black text-zinc-500 uppercase tracking-widest pl-1">In hoa Tiêu đề</label>
                                                <button onClick={() => setEditingBlock({ ...editingBlock, settings: { ...editingBlock.settings, titleUppercase: !editingBlock.settings?.titleUppercase } })} className={`w-full py-3 text-[10px] font-black uppercase tracking-widest rounded-2xl border transition-all ${editingBlock.settings?.titleUppercase ? 'bg-indigo-500/10 border-indigo-500/50 text-indigo-400' : 'bg-white/5 border-white/5 text-zinc-500'}`}>{editingBlock.settings?.titleUppercase ? 'Bật' : 'Tắt'}</button>
                                            </div>
                                            <div className="space-y-3">
                                                <label className="block text-[10px] font-black text-zinc-500 uppercase tracking-widest pl-1">In hoa Nội dung</label>
                                                <button onClick={() => setEditingBlock({ ...editingBlock, settings: { ...editingBlock.settings, contentUppercase: !editingBlock.settings?.contentUppercase } })} className={`w-full py-3 text-[10px] font-black uppercase tracking-widest rounded-2xl border transition-all ${editingBlock.settings?.contentUppercase ? 'bg-indigo-500/10 border-indigo-500/50 text-indigo-400' : 'bg-white/5 border-white/5 text-zinc-500'}`}>{editingBlock.settings?.contentUppercase ? 'Bật' : 'Tắt'}</button>
                                            </div>
                                        </div>
                                        {editingBlock.type === 'container' && (
                                            <div className="space-y-6">
                                                <div className="p-4 bg-indigo-500/5 border border-indigo-500/10 rounded-2xl space-y-4">
                                                    <div className="flex items-center gap-2 text-[10px] font-black text-indigo-400 uppercase tracking-widest">
                                                        <Layout size={12} /> Bố cục khung chứa
                                                    </div>
                                                    <div className="grid grid-cols-2 gap-3">
                                                        {(['col', 'row'] as const).map(dir => (
                                                            <button key={dir} onClick={() => setEditingBlock({ ...editingBlock, settings: { ...editingBlock.settings, direction: dir } })} className={`py-3 text-[10px] font-black uppercase tracking-widest rounded-xl border transition-all ${(editingBlock.settings?.direction || 'col') === dir ? 'bg-indigo-500 border-indigo-500 text-white shadow-lg shadow-indigo-500/20' : 'bg-black/20 border-white/5 text-zinc-500 hover:text-zinc-300'}`}>{dir === 'col' ? 'Xếp Dọc' : 'Xếp Ngang'}</button>
                                                        ))}
                                                    </div>

                                                    {(editingBlock.settings?.direction || 'col') === 'row' && (
                                                        <div className="pt-2 animate-fade-in">
                                                            <label className="block text-[9px] font-black text-zinc-500 uppercase tracking-widest mb-2 pl-1">Số cột hiển thị</label>
                                                            <div className="flex bg-black/20 p-1 rounded-xl border border-white/5 gap-1">
                                                                {[1, 2, 3, 4, 5, 6].map(num => (
                                                                    <button
                                                                        key={num}
                                                                        onClick={() => setEditingBlock({ ...editingBlock, settings: { ...editingBlock.settings, columns: num } })}
                                                                        className={`flex-1 h-8 flex items-center justify-center rounded-lg text-[10px] font-black transition-all ${(editingBlock.settings?.columns || 2) === num ? 'bg-indigo-500 text-white' : 'text-zinc-600 hover:text-zinc-400 hover:bg-white/5'}`}
                                                                    >
                                                                        {num}
                                                                    </button>
                                                                ))}
                                                            </div>
                                                        </div>
                                                    )}
                                                </div>

                                                <div className="space-y-3">
                                                    <label className="block text-[10px] font-black text-zinc-500 uppercase tracking-widest pl-1">Căn lề (Alignment)</label>
                                                    <div className="flex p-1 bg-black/40 border border-white/10 rounded-2xl">
                                                        {(['left', 'center', 'right'] as const).map(align => (
                                                            <button key={align} onClick={() => setEditingBlock({ ...editingBlock, settings: { ...editingBlock.settings, align } })} className={`flex-1 py-3 text-[10px] font-black uppercase tracking-widest rounded-xl transition-all ${(editingBlock.settings?.align || 'left') === align ? 'bg-indigo-500 text-white shadow-lg' : 'text-zinc-500 hover:text-zinc-300'}`}>{align}</button>
                                                        ))}
                                                    </div>
                                                </div>

                                                <div className="grid grid-cols-3 gap-4">
                                                    <div className="space-y-2">
                                                        <label className="block text-[10px] font-black text-zinc-500 uppercase tracking-widest pl-1">Gap</label>
                                                        <input type="number" className="w-full bg-black/40 border border-white/10 rounded-xl px-4 py-3 text-white text-sm outline-none focus:border-indigo-500/50" value={editingBlock.settings?.gap || 16} onChange={e => setEditingBlock({ ...editingBlock, settings: { ...editingBlock.settings, gap: Number(e.target.value) } })} />
                                                    </div>
                                                    <div className="space-y-2">
                                                        <label className="block text-[10px] font-black text-zinc-500 uppercase tracking-widest pl-1 transition-all">Padding</label>
                                                        <input type="number" className="w-full bg-black/40 border border-white/10 rounded-xl px-4 py-3 text-white text-sm outline-none focus:border-indigo-500/50" value={editingBlock.settings?.padding || 0} onChange={e => setEditingBlock({ ...editingBlock, settings: { ...editingBlock.settings, padding: Number(e.target.value) } })} />
                                                    </div>
                                                    <div className="space-y-2">
                                                        <label className="block text-[10px] font-black text-zinc-500 uppercase tracking-widest pl-1">Margin</label>
                                                        <input type="number" className="w-full bg-black/40 border border-white/10 rounded-xl px-4 py-3 text-white text-sm outline-none focus:border-indigo-500/50" value={editingBlock.settings?.margin || 0} onChange={e => setEditingBlock({ ...editingBlock, settings: { ...editingBlock.settings, margin: Number(e.target.value) } })} />
                                                    </div>
                                                </div>
                                            </div>
                                        )}
                                        {editingBlock.type === 'menu' && (
                                            <div>
                                                <label className="block text-[10px] font-black text-zinc-500 uppercase tracking-widest pl-1 mb-3">Hướng hiển thị Menu</label>
                                                <div className="flex p-1.5 bg-black/20 border border-white/10 rounded-2xl">
                                                    {(['vertical', 'horizontal'] as const).map(dir => (
                                                        <button key={dir} onClick={() => setEditingBlock({ ...editingBlock, settings: { ...editingBlock.settings, orientation: dir } })} className={`flex-1 py-2.5 text-[9px] font-black uppercase tracking-widest rounded-xl transition-all ${(editingBlock.settings?.orientation || 'vertical') === dir ? 'bg-zinc-700 text-white' : 'text-zinc-600 hover:text-zinc-400'}`}>{dir === 'vertical' ? 'Chiều Dọc' : 'Hàng Ngang'}</button>
                                                    ))}
                                                </div>
                                            </div>
                                        )}
                                    </div>
                                </div>
                            )}
                        </div>

                        <div className="p-8 border-t border-white/5 flex gap-4">
                            <button onClick={() => setEditingBlock(null)} className="flex-1 py-4 bg-white/5 text-zinc-500 hover:bg-white/10 rounded-2xl font-bold transition-all">Đóng</button>
                            <button onClick={() => {
                                setStructure(prev => {
                                    const updateInDepth = (blocks: FooterBlock[]): FooterBlock[] => {
                                        return blocks.map(b => {
                                            if (b.id === editingBlock.id) return editingBlock;
                                            if (b.settings?.columnsData) {
                                                const newCD = { ...b.settings.columnsData };
                                                for (const ck of Object.keys(newCD)) {
                                                    newCD[ck] = updateInDepth(newCD[ck]);
                                                }
                                                return { ...b, settings: { ...b.settings, columnsData: newCD } };
                                            }
                                            return b;
                                        });
                                    };
                                    return {
                                        ...prev,
                                        top: updateInDepth(prev.top),
                                        bottom: updateInDepth(prev.bottom),
                                        main: {
                                            col1: updateInDepth(prev.main.col1),
                                            col2: updateInDepth(prev.main.col2),
                                            col3: updateInDepth(prev.main.col3),
                                            col4: updateInDepth(prev.main.col4),
                                        }
                                    };
                                });
                                setEditingBlock(null);
                                toast.success('Cập nhật thành công');
                            }} className="flex-1 py-4 bg-indigo-500 hover:bg-indigo-600 text-white rounded-2xl font-bold shadow-xl shadow-indigo-500/20 active:scale-[0.98] transition-all">Xác nhận</button>
                        </div>
                    </div>
                </div>
            )}

            <MediaPickerModal
                isOpen={showMediaPicker}
                onClose={() => setShowMediaPicker(false)}
                onSelect={(url) => {
                    if (editingBlock && editingBlock.type === 'about') {
                        setEditingBlock({ ...editingBlock, settings: { ...editingBlock.settings, logoUrl: url } });
                    }
                }}
            />
        </div>
    );
};

export default FooterBuilder;
