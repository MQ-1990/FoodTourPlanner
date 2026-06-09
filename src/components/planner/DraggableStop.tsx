import { useDrag, useDrop } from 'react-dnd';
import { GripVertical, X } from 'lucide-react';
import { Restaurant } from '../../lib/data';

interface DraggableStopProps {
  stop: Restaurant;
  index: number;
  moveStop: (dragIndex: number, hoverIndex: number) => void;
  syncStopOrder: () => void;
  removeStop: (id: string) => void;
  onStopClick: (stop: Restaurant) => void;
}

interface DragItem {
  index: number;
  originalIndex: number;
}

export const DraggableStop = ({ stop, index, moveStop, syncStopOrder, removeStop, onStopClick }: DraggableStopProps) => {
  const [, ref] = useDrag({
    type: 'STOP',
    item: { index, originalIndex: index },
    end: (item: DragItem | undefined) => {
      if (item && item.index !== item.originalIndex) {
        syncStopOrder();
      }
    },
  });

  const [, drop] = useDrop({
    accept: 'STOP',
    hover: (item: DragItem) => {
      if (item.index !== index) {
        moveStop(item.index, index);
        item.index = index;
      }
    },
  });

  return (
    <div
      ref={(node) => ref(drop(node))}
      className="bg-white p-3 rounded-lg border border-gray-200 shadow-sm flex items-center gap-3 mb-3 cursor-grab active:cursor-grabbing hover:border-[#FF6B35] transition-colors"
    >
      <div className="text-gray-300 cursor-grab">
        <GripVertical className="w-5 h-5" />
      </div>
      <div
        className="flex flex-1 items-center gap-3 min-w-0 cursor-pointer"
        onClick={() => onStopClick(stop)}
      >
        <div className="w-12 h-12 rounded-md overflow-hidden shrink-0 bg-gray-100">
          <img
            src={stop.image || '/placeholder.svg'}
            alt=""
            className="w-full h-full object-cover"
          />
        </div>
        <div className="flex-1 min-w-0">
          <h4 className="font-bold text-slate-800 text-sm truncate hover:text-[#FF6B35] transition-colors">
            {stop.name}
          </h4>
          <p className="text-xs text-gray-500">Est. 1 hour</p>
        </div>
      </div>
      <button
        onClick={() => removeStop(stop.id)}
        className="text-gray-400 hover:text-red-500 p-1"
      >
        <X className="w-4 h-4" />
      </button>
    </div>
  );
};
