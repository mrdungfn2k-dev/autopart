"use client";
import { useState } from "react";
import { useRouter } from "next/navigation";

export interface AddressData {
  id: string;
  name: string;
  phone: string;
  city: string;
  address: string;
  isDefault: boolean;
  type: string;
}

interface AddressModalProps {
  onClose: () => void;
  onApply: (id: string) => void;
  addresses: AddressData[];
  selectedId: string;
}

export default function AddressModal({ onClose, onApply, addresses, selectedId }: AddressModalProps) {
  const [tempId, setTempId] = useState(selectedId);
  const router = useRouter();

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" onClick={onClose} />
      
      <div className="bg-white rounded-2xl shadow-2xl relative z-10 w-full max-w-lg flex flex-col max-h-[85vh]">
        <div className="flex items-center justify-between p-5 border-b border-[#f0f0f0]">
          <h2 className="text-xl font-bold text-[#44494d]">Địa chỉ của tôi</h2>
          <button onClick={onClose} className="text-[#8f9294] hover:text-red-500 text-xl leading-none">✕</button>
        </div>

        <div className="p-5 overflow-y-auto flex-1 space-y-4">
          {addresses.map((a) => (
            <label key={a.id} className={`flex items-start gap-4 p-4 rounded-xl border-2 transition-all cursor-pointer 
               ${tempId === a.id ? "border-orange-500 bg-orange-50" : "border-[#e5e5e5] hover:border-[#1a4b97]"}`}>
               
               <input type="radio" name="address" checked={tempId === a.id} onChange={() => setTempId(a.id)} className="mt-1 accent-orange-500 w-4 h-4" />
               <div className="flex-1">
                 <div className="flex items-center gap-2 mb-1">
                   <span className="font-bold text-[#44494d]">{a.name}</span>
                   <span className="text-[#e5e5e5]">|</span>
                   <span className="text-[#8f9294]">{a.phone}</span>
                 </div>
                 <p className="text-sm text-[#44494d]">{a.address}</p>
                 <p className="text-sm text-[#44494d] mb-2">{a.city}</p>
                 <div className="flex gap-2">
                   {a.isDefault && <span className="text-[10px] font-bold text-orange-500 border border-orange-500 px-1.5 py-0.5 rounded-sm">Mặc định</span>}
                   <span className="text-[10px] font-bold text-[#8f9294] border border-[#cbd5e1] px-1.5 py-0.5 rounded-sm bg-[#f8f8fa]">{a.type}</span>
                 </div>
               </div>
            </label>
          ))}
          <button onClick={() => { onClose(); router.push("/customer/address"); }} className="w-full py-3 rounded-xl border border-dashed border-[#cbd5e1] text-[#8f9294] font-bold hover:border-[#1a4b97] hover:text-[#1a4b97] transition-all">
            + Thêm Địa Chỉ Mới
          </button>
        </div>

        <div className="p-5 border-t border-[#f0f0f0] bg-white flex justify-end gap-3 rounded-b-2xl">
          <button onClick={onClose} className="px-6 py-2.5 rounded-xl font-bold text-[#8f9294] hover:bg-[#f8f8fa] border border-[#e5e5e5]">Huỷ</button>
          <button 
            onClick={() => onApply(tempId)}
            className="px-8 py-2.5 rounded-xl font-bold text-white shadow-md hover:opacity-90"
            style={{ background: "var(--ap-primary)" }}
          >
            Đồng ý
          </button>
        </div>
      </div>
    </div>
  );
}
