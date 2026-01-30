import {
    DndContext,
    DragEndEvent,
    DragOverEvent,
    DragStartEvent,
    KeyboardSensor,
    PointerSensor,
    pointerWithin,
    useSensor,
    useSensors
} from '@dnd-kit/core';
import {
    SortableContext,
    sortableKeyboardCoordinates,
    useSortable,
    verticalListSortingStrategy
} from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import {
    ArrowLeft,
    ArrowRight,
    ChevronDown,
    ChevronRight,
    Edit,
    GripVertical,
    Image as ImageIcon,
    Plus,
    Save,
    Trash2,
    X
} from 'lucide-react';
import React, { useEffect, useState } from 'react';
import toast from 'react-hot-toast';
import { useNavigate, useParams } from 'react-router-dom';
import { api } from '../../infrastructure/api.service';
import CustomSelect from '../components/CustomSelect';
import MediaPickerModal from '../components/MediaPickerModal';

interface MenuItem {
    id?: string;
    tempId: string;
    parentId?: string;
    type: string;
    referenceId?: string;
    title: string;
    url?: string;
    target?: string;
    icon?: string;
    displayMode: string;
    iconSize: string;
    order: number;
    children: MenuItem[];
    collapsed?: boolean;
}

interface Menu {
    id: string;
    name: string;
    locations: string[];
    isActive: boolean;
}

type DropPosition = 'before' | 'after' | 'inside';

// Sortable Menu Item Component
const SortableMenuItem: React.FC<{
    item: MenuItem;
    depth: number;
    onEdit: (item: MenuItem) => void;
    onDelete: (tempId: string) => void;
    onToggle: (tempId: string) => void;
    onIndent: (tempId: string) => void;
    onOutdent: (tempId: string) => void;
    canIndent: boolean;
    canOutdent: boolean;
    isDragging: boolean;
    dropPosition: DropPosition | null;
}> = ({ item, depth, onEdit, onDelete, onToggle, onIndent, onOutdent, canIndent, canOutdent, isDragging: isGlobalDragging, dropPosition }) => {
    const {
        attributes,
        listeners,
        setNodeRef,
        transform,
        transition,
        isDragging,
    } = useSortable({
        id: item.tempId,
        data: { item, depth }
    });

    const style = {
        transform: CSS.Transform.toString(transform),
        transition,
        opacity: isDragging ? 0.5 : 1,
    };

    return (
        <div ref={setNodeRef} style={style} className="mb-2 relative">
            {/* Drop indicator - BEFORE */}
            {dropPosition === 'before' && (
                <div className="absolute -top-1 left-0 right-0 h-1 bg-indigo-500 rounded-full z-10" />
            )}

            <div
                className={`group flex items-center gap-2 p-3 rounded-xl border transition-all
                    ${isDragging ? 'border-indigo-500 bg-indigo-500/10' : 'bg-[#111114] border-white/10 hover:border-white/20'}
                    ${dropPosition === 'inside' ? 'border-indigo-500 ring-2 ring-indigo-500/50' : ''}
                `}
                style={{ marginLeft: `${depth * 24}px` }}
            >
                {/* Drag Handle */}
                <div
                    {...attributes}
                    {...listeners}
                    className="cursor-grab active:cursor-grabbing text-zinc-500 hover:text-white"
                >
                    <GripVertical size={18} />
                </div>

                {/* Collapse Toggle */}
                {item.children.length > 0 && (
                    <button
                        onClick={() => onToggle(item.tempId)}
                        className="text-zinc-500 hover:text-white"
                    >
                        {item.collapsed ? <ChevronRight size={16} /> : <ChevronDown size={16} />}
                    </button>
                )}

                {/* Icon */}
                {item.icon && (
                    <img src={item.icon} className="w-5 h-5 object-cover rounded" alt="" />
                )}

                {/* Title & Type */}
                <div className="flex-1">
                    <div className="text-sm font-medium text-zinc-200">{item.title}</div>
                    <div className="text-xs text-zinc-500">{item.url || item.type}</div>
                </div>

                {/* Indent/Outdent */}
                <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                    <button
                        onClick={() => onOutdent(item.tempId)}
                        disabled={!canOutdent}
                        className={`p-1.5 rounded-lg transition-colors ${canOutdent ? 'text-zinc-500 hover:text-white hover:bg-white/10' : 'text-zinc-700 cursor-not-allowed'
                            }`}
                        title="Ra ngoài 1 cấp"
                    >
                        <ArrowLeft size={14} />
                    </button>
                    <button
                        onClick={() => onIndent(item.tempId)}
                        disabled={!canIndent}
                        className={`p-1.5 rounded-lg transition-colors ${canIndent ? 'text-zinc-500 hover:text-white hover:bg-white/10' : 'text-zinc-700 cursor-not-allowed'
                            }`}
                        title="Vào trong 1 cấp"
                    >
                        <ArrowRight size={14} />
                    </button>
                </div>

                {/* Edit */}
                <button
                    onClick={() => onEdit(item)}
                    className="p-2 text-zinc-500 hover:text-indigo-400 hover:bg-indigo-400/10 rounded-lg transition-colors"
                >
                    <Edit size={16} />
                </button>

                {/* Delete */}
                <button
                    onClick={() => onDelete(item.tempId)}
                    className="p-2 text-zinc-500 hover:text-red-400 hover:bg-red-400/10 rounded-lg transition-colors"
                >
                    <Trash2 size={16} />
                </button>
            </div>

            {/* Drop indicator - AFTER */}
            {dropPosition === 'after' && (
                <div className="absolute -bottom-1 left-0 right-0 h-1 bg-indigo-500 rounded-full z-10" />
            )}

            {/* Children */}
            {item.children.length > 0 && !item.collapsed && (
                <div className="mt-2">
                    {item.children.map((child, index) => (
                        <SortableMenuItem
                            key={child.tempId}
                            item={child}
                            depth={depth + 1}
                            onEdit={onEdit}
                            onDelete={onDelete}
                            onToggle={onToggle}
                            onIndent={onIndent}
                            onOutdent={onOutdent}
                            canIndent={index > 0}
                            canOutdent={true}
                            isDragging={isGlobalDragging}
                            dropPosition={null}
                        />
                    ))}
                </div>
            )}
        </div>
    );
};

const MenuBuilder = () => {
    const { id } = useParams();
    const navigate = useNavigate();

    const [menu, setMenu] = useState<Menu | null>(null);
    const [items, setItems] = useState<MenuItem[]>([]);
    const [loading, setLoading] = useState(false);
    const [saving, setSaving] = useState(false);

    // Source items
    const [activeTab, setActiveTab] = useState('categories');
    const [sourceItems, setSourceItems] = useState<any[]>([]);

    // Edit modal
    const [editingItem, setEditingItem] = useState<MenuItem | null>(null);
    const [showMediaPicker, setShowMediaPicker] = useState(false);

    // Drag state
    const [activeId, setActiveId] = useState<string | null>(null);
    const [overId, setOverId] = useState<string | null>(null);
    const [dropPosition, setDropPosition] = useState<DropPosition | null>(null);

    const sensors = useSensors(
        useSensor(PointerSensor, { activationConstraint: { distance: 5 } }),
        useSensor(KeyboardSensor, { coordinateGetter: sortableKeyboardCoordinates })
    );

    useEffect(() => {
        if (id) fetchMenu();
    }, [id]);

    useEffect(() => {
        fetchSourceItems();
    }, [activeTab]);

    const fetchMenu = async () => {
        try {
            setLoading(true);
            const { data } = await api.get(`/menus/${id}`);
            setMenu(data);

            // Convert flat items to tree
            const itemsWithChildren = (data.items || []).map((item: any) => ({
                ...item,
                tempId: item.id,
                children: [],
                collapsed: false
            }));

            // Build tree
            const tree = buildTree(itemsWithChildren);
            setItems(tree);
        } catch (error) {
            toast.error('Không tải được menu');
        } finally {
            setLoading(false);
        }
    };

    const buildTree = (flatItems: MenuItem[]): MenuItem[] => {
        const map: { [key: string]: MenuItem } = {};
        const roots: MenuItem[] = [];

        flatItems.forEach(item => {
            map[item.id || item.tempId] = { ...item, children: [] };
        });

        flatItems.forEach(item => {
            const currentItem = map[item.id || item.tempId];
            if (item.parentId && map[item.parentId]) {
                map[item.parentId].children.push(currentItem);
            } else {
                roots.push(currentItem);
            }
        });

        return roots;
    };

    const flattenTree = (items: MenuItem[], parentId?: string): any[] => {
        const result: any[] = [];
        items.forEach((item, index) => {
            const { children, collapsed, tempId, ...rest } = item;
            result.push({
                ...rest,
                parentId: parentId || null,
                order: index,
            });
            if (children.length > 0) {
                result.push(...flattenTree(children, item.id || tempId));
            }
        });
        return result;
    };

    const fetchSourceItems = async () => {
        try {
            const endpoints: Record<string, string> = {
                categories: '/categories',
                tags: '/tags',
                comics: '/comics',
                pages: '/pages',
            };
            const { data } = await api.get(endpoints[activeTab]);
            setSourceItems(Array.isArray(data) ? data : data.data || []);
        } catch (error) {
            console.error(error);
        }
    };

    // ============ DRAG HANDLERS ============
    const handleDragStart = (event: DragStartEvent) => {
        setActiveId(event.active.id as string);
    };

    const handleDragOver = (event: DragOverEvent) => {
        const { active, over } = event;

        if (!over) {
            setOverId(null);
            setDropPosition(null);
            return;
        }

        setOverId(over.id as string);

        const overRect = over.rect;
        if (overRect) {
            const activeRect = active.rect.current.translated;
            if (!activeRect) return;

            const relativeY = activeRect.top - overRect.top + (activeRect.height / 2);
            const height = overRect.height;

            if (relativeY < height * 0.25) {
                setDropPosition('before');
            } else if (relativeY > height * 0.75) {
                setDropPosition('after');
            } else {
                setDropPosition('inside');
            }
        }
    };

    const handleDragEnd = (event: DragEndEvent) => {
        const { active, over } = event;
        const currentDropPosition = dropPosition;

        setActiveId(null);
        setOverId(null);
        setDropPosition(null);

        if (!over || active.id === over.id || !currentDropPosition) return;

        const draggedId = active.id as string;
        const targetId = over.id as string;

        // Find items in tree
        const findInTree = (items: MenuItem[], id: string): { item: MenuItem; parent: MenuItem | null; index: number } | null => {
            for (let i = 0; i < items.length; i++) {
                if (items[i].tempId === id) {
                    return { item: items[i], parent: null, index: i };
                }
                if (items[i].children.length > 0) {
                    const found = findInTreeWithParent(items[i].children, id, items[i]);
                    if (found) return found;
                }
            }
            return null;
        };

        const findInTreeWithParent = (items: MenuItem[], id: string, parent: MenuItem): { item: MenuItem; parent: MenuItem | null; index: number } | null => {
            for (let i = 0; i < items.length; i++) {
                if (items[i].tempId === id) {
                    return { item: items[i], parent, index: i };
                }
                if (items[i].children.length > 0) {
                    const found = findInTreeWithParent(items[i].children, id, items[i]);
                    if (found) return found;
                }
            }
            return null;
        };

        setItems(prevItems => {
            const cloneTree = (items: MenuItem[]): MenuItem[] => {
                return items.map(item => ({
                    ...item,
                    children: cloneTree(item.children)
                }));
            };

            const newItems = cloneTree(prevItems);

            const draggedResult = findInTree(newItems, draggedId);
            const targetResult = findInTree(newItems, targetId);

            if (!draggedResult || !targetResult) return prevItems;

            // Check if target is descendant of dragged
            const isDescendant = (parent: MenuItem, childId: string): boolean => {
                for (const child of parent.children) {
                    if (child.tempId === childId) return true;
                    if (isDescendant(child, childId)) return true;
                }
                return false;
            };

            if (isDescendant(draggedResult.item, targetId)) {
                toast.error('Không thể kéo vào item con của chính nó');
                return prevItems;
            }

            // Remove dragged item from its current position
            const draggedParentList = draggedResult.parent ? draggedResult.parent.children : newItems;
            draggedParentList.splice(draggedResult.index, 1);

            // Re-find target after removal
            const newTargetResult = findInTree(newItems, targetId);
            if (!newTargetResult) return prevItems;

            const movedItem = { ...draggedResult.item };

            if (currentDropPosition === 'inside') {
                // Make it a child of target
                movedItem.parentId = newTargetResult.item.id || newTargetResult.item.tempId;
                newTargetResult.item.children.push(movedItem);
            } else {
                // Make sibling of target
                // Important: If target is root, parent remains undefined/null
                movedItem.parentId = newTargetResult.parent
                    ? (newTargetResult.parent.id || newTargetResult.parent.tempId)
                    : undefined;

                const targetParentList = newTargetResult.parent ? newTargetResult.parent.children : newItems;
                const insertIndex = currentDropPosition === 'before' ? newTargetResult.index : newTargetResult.index + 1;
                targetParentList.splice(insertIndex, 0, movedItem);
            }

            return newItems;
        });
    };

    // ============ INDENT / OUTDENT ============
    const handleIndent = (tempId: string) => {
        setItems(prevItems => {
            const cloneTree = (items: MenuItem[]): MenuItem[] => {
                return items.map(item => ({
                    ...item,
                    children: cloneTree(item.children)
                }));
            };

            const newItems = cloneTree(prevItems);

            const findAndIndent = (items: MenuItem[], parent?: MenuItem): boolean => {
                for (let i = 0; i < items.length; i++) {
                    if (items[i].tempId === tempId) {
                        if (i === 0) return false; // No previous sibling
                        const prevSibling = items[i - 1];
                        const [removed] = items.splice(i, 1);
                        removed.parentId = prevSibling.id || prevSibling.tempId;
                        prevSibling.children.push(removed);
                        return true;
                    }
                    if (findAndIndent(items[i].children, items[i])) return true;
                }
                return false;
            };

            findAndIndent(newItems);
            return newItems;
        });
    };

    const handleOutdent = (tempId: string) => {
        setItems(prevItems => {
            const cloneTree = (items: MenuItem[]): MenuItem[] => {
                return items.map(item => ({
                    ...item,
                    children: cloneTree(item.children)
                }));
            };

            const newItems = cloneTree(prevItems);

            const findAndOutdent = (items: MenuItem[], parent?: MenuItem, grandparent?: MenuItem): boolean => {
                for (let i = 0; i < items.length; i++) {
                    if (items[i].tempId === tempId) {
                        if (!parent) return false; // Already root level
                        const [removed] = items.splice(i, 1);
                        removed.parentId = grandparent ? (grandparent.id || grandparent.tempId) : undefined;

                        // Find parent in grandparent's list and insert after it
                        const parentList = grandparent ? grandparent.children : newItems;
                        const parentIndex = parentList.findIndex(item => item.tempId === parent.tempId);
                        parentList.splice(parentIndex + 1, 0, removed);
                        return true;
                    }
                    if (findAndOutdent(items[i].children, items[i], parent)) return true;
                }
                return false;
            };

            findAndOutdent(newItems);
            return newItems;
        });
    };

    // ============ CRUD ============
    const addCustomLink = () => {
        const newItem: MenuItem = {
            tempId: `temp-${Date.now()}`,
            type: 'CUSTOM',
            title: 'Link mới',
            url: '#',
            target: '_self',
            displayMode: 'TEXT_ICON',
            iconSize: 'NORMAL',
            order: items.length,
            children: [],
        };
        setItems([...items, newItem]);
    };

    const addSourceItem = (source: any) => {
        const newItem: MenuItem = {
            tempId: `temp-${Date.now()}`,
            type: activeTab.toUpperCase(),
            referenceId: source.id,
            title: source.title || source.name,
            displayMode: 'TEXT_ICON',
            iconSize: 'NORMAL',
            order: items.length,
            children: [],
        };
        setItems([...items, newItem]);
        toast.success(`Đã thêm "${newItem.title}"`);
    };

    const deleteItem = (tempId: string) => {
        const removeFromTree = (items: MenuItem[]): MenuItem[] => {
            return items
                .filter(item => item.tempId !== tempId)
                .map(item => ({
                    ...item,
                    children: removeFromTree(item.children)
                }));
        };
        setItems(removeFromTree(items));
    };

    const toggleCollapse = (tempId: string) => {
        const toggleInTree = (items: MenuItem[]): MenuItem[] => {
            return items.map(item => {
                if (item.tempId === tempId) {
                    return { ...item, collapsed: !item.collapsed };
                }
                return { ...item, children: toggleInTree(item.children) };
            });
        };
        setItems(toggleInTree(items));
    };

    // ============ SAVE ============
    const saveMenu = async () => {
        if (!menu) return;
        try {
            setSaving(true);

            // Build tree for save (with children)
            const cleanTree = (items: MenuItem[]): any[] => {
                return items.map((item, index) => ({
                    type: item.type,
                    referenceId: item.referenceId || null,
                    title: item.title,
                    url: item.url || null,
                    target: item.target || '_self',
                    icon: item.icon || null,
                    displayMode: item.displayMode || 'TEXT_ICON',
                    iconSize: item.iconSize || 'NORMAL',
                    order: index,
                    children: cleanTree(item.children)
                }));
            };

            const treeItems = cleanTree(items);
            console.log('Saving menu items:', JSON.stringify(treeItems, null, 2));

            await api.put(`/menus/${menu.id}/items`, { items: treeItems });
            toast.success('Đã lưu menu thành công!');
            fetchMenu();
        } catch (error: any) {
            console.error('Save menu error:', error);
            toast.error(error?.response?.data?.message || 'Lưu menu thất bại');
        } finally {
            setSaving(false);
        }
    };

    const flatItemsForContext: MenuItem[] = [];
    const collectItems = (items: MenuItem[]) => {
        items.forEach(item => {
            flatItemsForContext.push(item);
            collectItems(item.children);
        });
    };
    collectItems(items);

    const updateItem = (updatedItem: MenuItem) => {
        const updateInTree = (items: MenuItem[]): MenuItem[] => {
            return items.map(item => {
                if (item.tempId === updatedItem.tempId) {
                    return { ...updatedItem, children: item.children };
                }
                return { ...item, children: updateInTree(item.children) };
            });
        };
        setItems(updateInTree(items));
        setEditingItem(null);
    };

    return (
        <div className="grid grid-cols-3 gap-6 h-[calc(100vh-100px)] font-inter">
            {/* Left: Menu Structure */}
            <div className="col-span-2 flex flex-col gap-4">
                <div className="flex justify-between items-center">
                    <div>
                        <h1 className="text-2xl font-bold text-white font-outfit">{menu?.name || 'Menu'}</h1>
                        <p className="text-zinc-500 text-xs">
                            Kéo vào <span className="text-indigo-400 font-bold">giữa item</span> để tạo submenu •
                            Kéo vào <span className="text-indigo-400 font-bold">trên/dưới</span> để sắp xếp
                        </p>
                    </div>
                    <div className="flex gap-2">
                        <button
                            onClick={() => navigate('/menus')}
                            className="px-4 py-2 text-zinc-400 hover:text-white transition-colors"
                        >
                            Quay lại
                        </button>
                        <button
                            onClick={saveMenu}
                            disabled={saving}
                            className="flex items-center gap-2 px-4 py-2 bg-indigo-500 hover:bg-indigo-600 text-white font-medium rounded-xl shadow-lg shadow-indigo-500/20 active:scale-95 transition-all disabled:opacity-50"
                        >
                            <Save size={16} />
                            {saving ? 'Đang lưu...' : 'Lưu menu'}
                        </button>
                    </div>
                </div>

                {/* Menu Items */}
                <div className="flex-1 bg-[#0a0a0c] rounded-2xl border border-white/10 p-4 overflow-y-auto">
                    {loading ? (
                        <div className="text-zinc-500 text-center py-10">Đang tải...</div>
                    ) : items.length === 0 ? (
                        <div className="text-zinc-500 text-center py-10">
                            Chưa có menu item. Thêm từ panel bên phải.
                        </div>
                    ) : (
                        <DndContext
                            sensors={sensors}
                            collisionDetection={pointerWithin}
                            onDragStart={handleDragStart}
                            onDragOver={handleDragOver}
                            onDragEnd={handleDragEnd}
                        >
                            <SortableContext
                                items={flatItemsForContext.map(i => i.tempId)}
                                strategy={verticalListSortingStrategy}
                            >
                                {items.map((item, index) => (
                                    <SortableMenuItem
                                        key={item.tempId}
                                        item={item}
                                        depth={0}
                                        onEdit={setEditingItem}
                                        onDelete={deleteItem}
                                        onToggle={toggleCollapse}
                                        onIndent={handleIndent}
                                        onOutdent={handleOutdent}
                                        canIndent={index > 0}
                                        canOutdent={false}
                                        isDragging={!!activeId}
                                        dropPosition={overId === item.tempId ? dropPosition : null}
                                    />
                                ))}
                            </SortableContext>
                        </DndContext>
                    )}
                </div>
            </div>

            {/* Right: Add Items */}
            <div className="flex flex-col gap-4">
                <div className="bg-[#0a0a0c] rounded-2xl border border-white/10 p-4">
                    <h2 className="text-lg font-bold text-white mb-4">Thêm mục menu</h2>

                    {/* Custom Link */}
                    <button
                        onClick={addCustomLink}
                        className="w-full flex items-center justify-center gap-2 px-4 py-3 bg-indigo-500 hover:bg-indigo-600 text-white font-bold rounded-xl shadow-lg shadow-indigo-500/20 active:scale-95 transition-all mb-4"
                    >
                        <Plus size={16} />
                        Link tùy chỉnh
                    </button>

                    {/* Source Tabs */}
                    <div className="flex gap-2 mb-4">
                        {['categories', 'tags', 'comics', 'pages'].map(tab => (
                            <button
                                key={tab}
                                onClick={() => setActiveTab(tab)}
                                className={`flex-1 px-3 py-2 rounded-lg text-sm font-medium transition-colors ${activeTab === tab
                                    ? 'bg-indigo-500/20 text-indigo-400'
                                    : 'bg-white/5 text-zinc-400 hover:bg-white/10'
                                    }`}
                            >
                                {tab === 'categories' ? 'Thể loại' : tab === 'tags' ? 'Tags' : tab === 'comics' ? 'Truyện' : 'Trang'}
                            </button>
                        ))}
                    </div>

                    {/* Source Items List */}
                    <div className="max-h-[400px] overflow-y-auto space-y-1">
                        {sourceItems.map(source => (
                            <button
                                key={source.id}
                                onClick={() => addSourceItem(source)}
                                className="w-full text-left px-3 py-2 text-sm text-zinc-300 hover:bg-white/5 rounded-lg transition-colors"
                            >
                                {source.title || source.name}
                            </button>
                        ))}
                    </div>
                </div>
            </div>

            {/* Edit Modal */}
            {editingItem && (
                <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
                    <div className="bg-[#111114] rounded-2xl border border-white/10 p-6 w-[500px] max-h-[80vh] overflow-y-auto">
                        <div className="flex justify-between items-center mb-6">
                            <h2 className="text-xl font-bold text-white">Chỉnh sửa Menu Item</h2>
                            <button onClick={() => setEditingItem(null)} className="text-zinc-500 hover:text-white">
                                <X size={20} />
                            </button>
                        </div>

                        <div className="space-y-4">
                            <div>
                                <label className="block text-sm text-zinc-400 mb-1">Tiêu đề</label>
                                <input
                                    type="text"
                                    value={editingItem.title}
                                    onChange={(e) => setEditingItem({ ...editingItem, title: e.target.value })}
                                    className="w-full px-4 py-2 bg-white/5 border border-white/10 rounded-xl text-white focus:outline-none focus:border-indigo-500"
                                />
                            </div>

                            <div>
                                <label className="block text-sm text-zinc-400 mb-1">URL</label>
                                <input
                                    type="text"
                                    value={editingItem.url || ''}
                                    onChange={(e) => setEditingItem({ ...editingItem, url: e.target.value })}
                                    className="w-full px-4 py-2 bg-white/5 border border-white/10 rounded-xl text-white focus:outline-none focus:border-indigo-500"
                                />
                            </div>

                            <div>
                                <label className="block text-sm text-zinc-400 mb-1">Target</label>
                                <CustomSelect
                                    value={editingItem.target || '_self'}
                                    options={[
                                        { value: '_self', label: 'Cùng tab' },
                                        { value: '_blank', label: 'Tab mới' }
                                    ]}
                                    onChange={(value) => setEditingItem({ ...editingItem, target: value })}
                                />
                            </div>

                            <div>
                                <label className="block text-sm text-zinc-400 mb-1">Icon</label>
                                <div className="flex gap-2">
                                    {editingItem.icon && (
                                        <img src={editingItem.icon} className="w-10 h-10 object-cover rounded-lg border border-white/10" alt="" />
                                    )}
                                    <button
                                        onClick={() => setShowMediaPicker(true)}
                                        className="flex-1 flex items-center justify-center gap-2 px-4 py-2 bg-white/5 border border-white/10 rounded-xl text-zinc-400 hover:bg-white/10 transition-colors"
                                    >
                                        <ImageIcon size={16} />
                                        Chọn icon
                                    </button>
                                    {editingItem.icon && (
                                        <button
                                            onClick={() => setEditingItem({ ...editingItem, icon: undefined })}
                                            className="px-3 py-2 bg-red-500/10 border border-red-500/20 rounded-xl text-red-400 hover:bg-red-500/20"
                                        >
                                            <X size={16} />
                                        </button>
                                    )}
                                </div>
                            </div>

                            <div>
                                <label className="block text-sm text-zinc-400 mb-1">Hiển thị</label>
                                <CustomSelect
                                    value={editingItem.displayMode}
                                    options={[
                                        { value: 'TEXT_ICON', label: 'Text + Icon' },
                                        { value: 'TEXT', label: 'Chỉ Text' },
                                        { value: 'ICON', label: 'Chỉ Icon' },
                                    ]}
                                    onChange={(value) => setEditingItem({ ...editingItem, displayMode: value })}
                                />
                            </div>

                            <div className="flex gap-2 pt-4">
                                <button
                                    onClick={() => setEditingItem(null)}
                                    className="flex-1 px-4 py-2 bg-white/5 text-zinc-400 rounded-xl hover:bg-white/10 transition-colors"
                                >
                                    Hủy
                                </button>
                                <button
                                    onClick={() => updateItem(editingItem)}
                                    className="flex-1 px-4 py-2 bg-indigo-500 text-white rounded-xl hover:bg-indigo-600 transition-colors"
                                >
                                    Lưu thay đổi
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            )}

            {/* Media Picker */}
            {showMediaPicker && (
                <MediaPickerModal
                    isOpen={showMediaPicker}
                    onSelect={(url) => {
                        if (editingItem) {
                            setEditingItem({ ...editingItem, icon: url });
                        }
                        setShowMediaPicker(false);
                    }}
                    onClose={() => setShowMediaPicker(false)}
                />
            )}
        </div>
    );
};

export default MenuBuilder;
