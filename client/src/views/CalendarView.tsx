import React, { useState } from 'react';
import { Calendar as CalendarIcon, ChevronLeft, ChevronRight, Clock, Plus } from 'lucide-react';
import { Task } from '../types/crm';

interface CalendarViewProps {
  tasks: Task[];
  onAddTask: () => void;
}

export const CalendarView: React.FC<CalendarViewProps> = ({ tasks, onAddTask }) => {
  const [currentMonth, setCurrentMonth] = useState('October 2025');

  const days = Array.from({ length: 31 }, (_, i) => i + 1);

  return (
    <div className="p-4 space-y-4 max-w-[1536px] mx-auto select-none">
      <div className="bg-white p-3.5 rounded-[8px] border border-[#e5edf5] flex items-center justify-between">
        <div className="flex items-center gap-3">
          <CalendarIcon className="w-5 h-5 text-[#087cf5]" />
          <div>
            <h1 className="text-[16px] font-bold text-[#101d37]">Counselling Calendar</h1>
            <p className="text-[11.5px] text-[#52627a]">Appointments, deadlines & scheduled follow-up calls</p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <div className="flex items-center border border-slate-200 rounded-md">
            <button className="p-1 hover:bg-slate-50"><ChevronLeft className="w-4 h-4 text-slate-600" /></button>
            <span className="px-3 text-xs font-bold text-slate-800">{currentMonth}</span>
            <button className="p-1 hover:bg-slate-50"><ChevronRight className="w-4 h-4 text-slate-600" /></button>
          </div>
          <button
            onClick={onAddTask}
            className="flex items-center gap-1.5 px-3 py-1.5 bg-[#087cf5] text-white rounded text-xs font-semibold hover:bg-blue-600 shadow-xs"
          >
            <Plus className="w-3.5 h-3.5" />
            <span>Book Appointment</span>
          </button>
        </div>
      </div>

      <div className="bg-white rounded-[8px] border border-[#e5edf5] shadow-crm-card p-4">
        {/* Days of week */}
        <div className="grid grid-cols-7 gap-2 text-center text-xs font-bold text-slate-500 uppercase pb-2 border-b">
          <div>Mon</div>
          <div>Tue</div>
          <div>Wed</div>
          <div>Thu</div>
          <div>Fri</div>
          <div>Sat</div>
          <div>Sun</div>
        </div>

        {/* Days grid */}
        <div className="grid grid-cols-7 gap-2 pt-2">
          {days.map((d) => {
            const hasTaskOnDay = d === 10;
            return (
              <div
                key={d}
                className={`min-h-[90px] p-2 rounded border border-slate-100 flex flex-col justify-between ${
                  hasTaskOnDay ? 'bg-blue-50/50 border-blue-200' : 'hover:bg-slate-50'
                }`}
              >
                <div className="flex justify-between items-center text-xs">
                  <span className={`font-bold ${hasTaskOnDay ? 'text-[#087cf5]' : 'text-slate-700'}`}>
                    {d}
                  </span>
                  {hasTaskOnDay && (
                    <span className="w-2 h-2 rounded-full bg-[#087cf5]" />
                  )}
                </div>

                {hasTaskOnDay && (
                  <div className="space-y-1 mt-1">
                    <div className="bg-[#087cf5] text-white text-[10px] p-1 rounded font-medium truncate">
                      11:00 AM Call Rahul
                    </div>
                    <div className="bg-amber-500 text-white text-[10px] p-1 rounded font-medium truncate">
                      12:30 PM Priya Session
                    </div>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
};
