'use client';

import { useState } from 'react';
import { mockProfessorCourses, mockWeeks, mockMaterials, type Material } from '@/data/mock/mock-data';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from '@/components/ui/accordion';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Plus, FileText, Play, File } from 'lucide-react';

export default function ProfessorMaterials() {
  const [selectedCourseId, setSelectedCourseId] = useState(mockProfessorCourses[0].id);
  const [materials, setMaterials] = useState<Material[]>(mockMaterials);

  const course = mockProfessorCourses.find(c => c.id === selectedCourseId)!;

  const addMaterial = (weekId: string, newMaterial: Omit<Material, 'id' | 'weekId'>) => {
    const newMat: Material = {
      id: `m${Date.now()}`,
      weekId,
      ...newMaterial,
    };
    setMaterials(prev => [...prev, newMat]);
    alert('✅ Materi berhasil ditambahkan!');
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div 
        className="rounded-3xl p-8 text-white flex justify-between items-end"
        style={{ background: 'linear-gradient(135deg, #0F172B 0%, #0D542B 50%, #004F3B 100%)' }}
      >
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Manage Materials</h1>
          <p className="text-white/80">Tambah & kelola materi perkuliahan per minggu</p>
        </div>
      </div>

      {/* Course Selector */}
      <Card>
        <CardHeader>
          <CardTitle>Pilih Mata Kuliah</CardTitle>
        </CardHeader>
        <CardContent>
          <Select value={selectedCourseId} onValueChange={setSelectedCourseId}>
            <SelectTrigger className="w-full md:w-96">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {mockProfessorCourses.map(course => (
                <SelectItem key={course.id} value={course.id}>
                  {course.title}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </CardContent>
      </Card>

      {/* Weeks Accordion */}
      <Accordion type="multiple" defaultValue={['w1', 'w2']} className="w-full">
        {mockWeeks.map(week => {
          const weekMaterials = materials.filter(m => m.weekId === week.id);

          return (
            <AccordionItem key={week.id} value={week.id} className="border border-gray-200 rounded-3xl mb-4">
              <AccordionTrigger className="px-6 py-5 text-lg font-semibold">
                Minggu {week.weekNumber} - {week.title}
                <span className="ml-auto text-sm font-normal text-gray-500">
                  {weekMaterials.length} materi
                </span>
              </AccordionTrigger>
              <AccordionContent className="px-6 pb-6">
                <div className="space-y-3">
                  {weekMaterials.map(mat => (
                    <div key={mat.id} className="flex items-center gap-4 bg-gray-50 p-4 rounded-2xl">
                      {mat.type === 'pdf' && <FileText className="text-red-500" />}
                      {mat.type === 'ppt' && <File className="text-blue-500" />}
                      {mat.type === 'video' && <Play className="text-emerald-500" />}
                      {mat.type === 'yt_link' && <Play className="text-red-500" />}
                      <div className="flex-1">
                        <p className="font-medium">{mat.title}</p>
                        <a href={mat.contentUrl} className="text-xs text-[#0D542B] hover:underline">Lihat materi →</a>
                      </div>
                    </div>
                  ))}
                </div>

                {/* Form Tambah Materi */}
                <div className="mt-8 border-t pt-6">
                  <h4 className="font-semibold mb-4 flex items-center gap-2">
                    <Plus className="w-4 h-4" /> Tambah Materi Baru
                  </h4>
                  <AddMaterialForm weekId={week.id} onAdd={addMaterial} />
                </div>
              </AccordionContent>
            </AccordionItem>
          );
        })}
      </Accordion>
    </div>
  );
}

// Component form kecil
function AddMaterialForm({ weekId, onAdd }: { weekId: string; onAdd: (weekId: string, data: any) => void }) {
  const [title, setTitle] = useState('');
  const [type, setType] = useState<Material['type']>('pdf');
  const [url, setUrl] = useState('');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!title || !url) return;
    onAdd(weekId, { title, type, contentUrl: url });
    setTitle('');
    setUrl('');
  };

  return (
    <form onSubmit={handleSubmit} className="grid grid-cols-1 md:grid-cols-12 gap-4">
      <div className="md:col-span-5">
        <Label>Judul Materi</Label>
        <Input value={title} onChange={e => setTitle(e.target.value)} placeholder="Contoh: Slide Minggu 1" />
      </div>
      <div className="md:col-span-3">
        <Label>Tipe</Label>
        <Select value={type} onValueChange={(v: any) => setType(v)}>
          <SelectTrigger>
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="pdf">PDF</SelectItem>
            <SelectItem value="ppt">PPT</SelectItem>
            <SelectItem value="video">Video</SelectItem>
            <SelectItem value="yt_link">YouTube</SelectItem>
          </SelectContent>
        </Select>
      </div>
      <div className="md:col-span-4">
        <Label>Link / URL</Label>
        <Input value={url} onChange={e => setUrl(e.target.value)} placeholder="https://..." />
      </div>
      <Button type="submit" className="md:col-span-12 mt-2 bg-[#0D542B]">
        <Plus className="mr-2 h-4 w-4" />
        Tambah Materi
      </Button>
    </form>
  );
}