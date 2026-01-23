import React, { useState, useMemo, useEffect } from 'react';
import { 
  Rocket, 
  CheckCircle, 
  AlertTriangle, 
  FileText, 
  LayoutDashboard, 
  Link as LinkIcon, 
  Plus, 
  Search, 
  Trash2, 
  Edit, 
  Save, 
  X, 
  Activity,
  ShieldCheck,
  Target,
  Compass,
  ArrowRight,
  BookOpen,
  Download,
  Flag,
  Scale,
  Filter,
  Paperclip,
  ChevronDown
} from 'lucide-react';

// ==========================================
// 1. HELPER COMPONENTS & UTILITIES
// ==========================================

const Card = ({ children, className = '' }) => (
  <div className={`bg-white rounded-xl shadow-sm border border-slate-200 ${className}`}>
    {children}
  </div>
);

const Badge = ({ children, color = 'blue', className = '' }) => {
  const colors = {
    blue: 'bg-blue-100 text-blue-800 border-blue-200',
    green: 'bg-green-100 text-green-800 border-green-200',
    yellow: 'bg-amber-100 text-amber-800 border-amber-200',
    red: 'bg-red-100 text-red-800 border-red-200',
    gray: 'bg-slate-100 text-slate-800 border-slate-200',
    purple: 'bg-purple-100 text-purple-800 border-purple-200',
    indigo: 'bg-indigo-100 text-indigo-800 border-indigo-200',
    teal: 'bg-teal-100 text-teal-800 border-teal-200',
    orange: 'bg-orange-100 text-orange-800 border-orange-200',
  };
  return (
    <span className={`px-2.5 py-0.5 rounded-full text-xs font-medium border ${colors[color] || colors.gray} ${className}`}>
      {children}
    </span>
  );
};

const NavButton = ({ active, onClick, icon, label }) => (
  <button
    onClick={onClick}
    className={`flex items-center space-x-2 px-3 py-2 rounded-md text-sm font-medium transition-colors whitespace-nowrap ${
      active ? 'bg-slate-800 text-white' : 'text-slate-300 hover:bg-slate-800 hover:text-white'
    }`}
  >
    {icon}
    <span>{label}</span>
  </button>
);

const StatCard = ({ title, value, subtitle, icon, color }) => {
    const bgColors = {
      blue: 'bg-blue-50',
      green: 'bg-green-50',
      indigo: 'bg-indigo-50',
      amber: 'bg-amber-50',
    };
    
    return (
      <Card className="p-5 flex items-start justify-between">
        <div>
          <p className="text-sm font-medium text-slate-500">{title}</p>
          <p className="mt-1 text-2xl font-bold text-slate-900">{value}</p>
          {subtitle && <p className="mt-1 text-xs text-slate-400">{subtitle}</p>}
        </div>
        <div className={`p-3 rounded-lg ${bgColors[color] || 'bg-slate-50'}`}>
          {icon}
        </div>
      </Card>
    );
};

const StatusIndicator = ({ status }) => {
  const color = status === 'Validated' || status === 'Verified' ? 'blue' : 
                status === 'Failed' ? 'red' : 
                status.includes('Review') || status.includes('Progress') ? 'green' : 'gray';
  return <Badge color={color}>{status}</Badge>;
};

const getNextId = (items, prefix) => {
  const nums = items
    .filter(i => i.id && i.id.startsWith(prefix))
    .map(i => {
      const match = i.id.replace(prefix, '').match(/\d+/);
      return match ? parseInt(match[0], 10) : 0;
    })
    .filter(n => !isNaN(n));
  
  const max = nums.length > 0 ? Math.max(...nums) : 0;
  return `${prefix}${String(max + 1).padStart(3, '0')}`;
};

// ==========================================
// 2. CONSTANTS & MOCK DATA
// ==========================================

const REGULATORY_LIBRARY = [
  {
    code: '14 CFR 25.1309',
    title: 'Equipment, systems, and installations',
    source: 'FAA Part 25',
    category: 'Standard',
    text: 'The equipment, systems, and installations whose functioning is required by this subchapter, must be designed to ensure that they perform their intended functions under any foreseeable operating condition.'
  },
  {
    code: 'CS 25.1309',
    title: 'Equipment, systems, and installations',
    source: 'EASA CS-25',
    category: 'Standard',
    text: 'The equipment, systems, and installations must be designed to ensure that they perform their intended functions under any foreseeable operating condition.'
  },
  {
    code: '14 CFR 25.671',
    title: 'General: Control Systems',
    source: 'FAA Part 25',
    category: 'Standard',
    text: 'Each control and control system must operate with the ease, smoothness, and positiveness appropriate to its function.'
  },
  {
    code: '14 CFR 25.901',
    title: 'Installation: Powerplant',
    source: 'FAA Part 25',
    category: 'Standard',
    text: 'For each powerplant an installation must be established that includes the installation of instructions for continued airworthiness.'
  },
  {
    code: 'CS 25.801',
    title: 'Ditching',
    source: 'EASA CS-25',
    category: 'Standard',
    text: 'If certification with ditching provisions is requested, the aeroplane must meet the requirements of this paragraph and §§ 25.807(e), 25.1411 and 25.1415(a).'
  },
  {
    code: '14 CFR 25.1301',
    title: 'Function and installation',
    source: 'FAA Part 25',
    category: 'Standard',
    text: 'Each item of installed equipment must be of a kind and design appropriate to its intended function.'
  },
  {
    code: '14 CFR 25.981',
    title: 'Fuel Tank Ignition Prevention',
    source: 'FAA Part 25',
    category: 'Standard',
    text: 'No ignition source may be present at each point in the fuel tank or fuel tank system where catastrophic failure could occur.'
  },
  {
    code: 'AC 25.1309-1A',
    title: 'System Design and Analysis',
    source: 'Advisory Circular',
    category: 'Non-Standard',
    text: 'Describes acceptable means for showing compliance with the requirements of § 25.1309 regarding system safety assessments.'
  },
  {
    code: 'AC 20-115D',
    title: 'Airborne Software Assurance',
    source: 'Advisory Circular',
    category: 'Non-Standard',
    text: 'Recognizes DO-178C as an acceptable means of compliance for the software aspects of airborne systems and equipment.'
  },
  {
    code: 'AC 20-152A',
    title: 'Development Assurance (Hardware)',
    source: 'Advisory Circular',
    category: 'Non-Standard',
    text: 'Recognizes DO-254 as an acceptable means of compliance for the design assurance of airborne electronic hardware.'
  },
  {
    code: 'AC 25-17A',
    title: 'Transport Airplane EWIS',
    source: 'Advisory Circular',
    category: 'Non-Standard',
    text: 'Guidance for certification of electrical wiring interconnection systems (EWIS) on transport category airplanes.'
  }
];

const INITIAL_GOALS = [
  { id: 'GOAL-01', title: 'Safe', description: 'Ensure the highest level of safety for passengers and crew.' },
  { id: 'GOAL-02', title: 'Certifiable', description: 'Meet all regulatory requirements for Type Certification (TC).' },
  { id: 'GOAL-03', title: 'Market Leader', description: 'Provide superior performance and economics to capture market share.' }
];

const INITIAL_NEEDS = [
  {
    id: 'CUST-001',
    title: 'Long Range Capability',
    source: 'Customer',
    text: 'The aircraft must be capable of flying 3000nm with full payload without refueling.',
    linkedGoalId: 'GOAL-03'
  },
  {
    id: 'REG-001',
    title: 'Noise Abatement Stage 5',
    source: 'Regulatory (FAA)',
    text: 'Propulsion system noise levels must meet Stage 5 limits as defined in 14 CFR Part 36.',
    linkedGoalId: 'GOAL-02'
  }
];

const INITIAL_CONOPS = [
  {
    id: 'OPS-001',
    title: 'Trans-Atlantic Flight',
    phase: 'Cruise',
    text: 'The aircraft executes a 7-hour cruise at 40,000ft ensuring cabin comfort and fuel efficiency.',
    linkedNeedId: 'CUST-001'
  },
  {
    id: 'OPS-002',
    title: 'Rejected Takeoff (RTO)',
    phase: 'Takeoff',
    text: 'Pilots must be able to safely stop the aircraft on the runway if an engine failure occurs before V1.',
    linkedNeedId: 'REG-001'
  }
];

const INITIAL_REQS = [
  {
    id: 'SYS-001',
    title: 'Maximum Takeoff Weight',
    text: 'The system shall have a Maximum Takeoff Weight (MTOW) not exceeding 75,000 kg.',
    type: 'Performance',
    criticality: 'DAL B',
    verificationMethod: 'Analysis',
    validationStatus: 'Validated',
    verificationStatus: 'Verified',
    parentId: null,
    sourceNeedId: 'CUST-001', 
    sourceConOpsId: 'OPS-001',
    lastUpdated: '2023-10-15',
    validationArtifact: null,
    verificationArtifact: null,
  },
  {
    id: 'SYS-002',
    title: 'Thrust Reverser Deployment',
    text: 'The thrust reverser system shall prevent deployment in flight.',
    type: 'Safety',
    criticality: 'DAL A',
    verificationMethod: 'Test',
    validationStatus: 'Validated',
    verificationStatus: 'Open',
    parentId: null,
    sourceNeedId: 'REG-001',
    sourceConOpsId: 'OPS-002',
    lastUpdated: '2023-10-16',
    validationArtifact: null,
    verificationArtifact: null,
  },
  {
    id: 'SYS-003',
    title: 'Actuator Lock Mechanism',
    text: 'The actuator shall include a mechanical locking mechanism that engages when stowed.',
    type: 'Functional',
    criticality: 'DAL A',
    verificationMethod: 'Inspection',
    validationStatus: 'Draft',
    verificationStatus: 'Open',
    parentId: 'SYS-002',
    sourceNeedId: null,
    sourceConOpsId: null,
    lastUpdated: '2023-10-18',
    validationArtifact: null,
    verificationArtifact: null,
  }
];

// ==========================================
// 3. SUB-VIEW COMPONENTS
// ==========================================

const DashboardView = ({ stats, requirements, needs, conops, goals }) => {
  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-2">
        {goals.map(goal => (
          <div key={goal.id} className="bg-gradient-to-br from-slate-800 to-slate-900 rounded-xl p-5 text-white shadow-md relative overflow-hidden">
            <div className="absolute top-0 right-0 p-4 opacity-10">
              <Flag size={64} />
            </div>
            <div className="relative z-10">
               <div className="flex items-center gap-2 mb-2">
                 <Flag size={16} className="text-orange-400" />
                 <span className="text-xs font-bold tracking-wider text-slate-400 uppercase">Top Level Goal</span>
               </div>
               <h3 className="text-xl font-bold mb-1">{goal.title}</h3>
               <p className="text-sm text-slate-300">{goal.description}</p>
            </div>
          </div>
        ))}
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard title="Total Requirements" value={stats.total} icon={<FileText className="text-blue-500" />} color="blue" />
        <StatCard title="Validated" value={`${Math.round((stats.validated / stats.total) * 100) || 0}%`} subtitle={`${stats.validated}/${stats.total} reqs`} icon={<ShieldCheck className="text-green-500" />} color="green" />
        <StatCard title="Verified" value={`${Math.round((stats.verified / stats.total) * 100) || 0}%`} subtitle={`${stats.verified}/${stats.total} reqs`} icon={<CheckCircle className="text-indigo-500" />} color="indigo" />
        <StatCard title="Safety Critical" value={stats.safetyCritical} subtitle="DAL A / Safety Type" icon={<AlertTriangle className="text-amber-500" />} color="amber" />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <Card className="lg:col-span-2 p-6">
          <h3 className="text-lg font-semibold text-slate-800 mb-6">Workflow Maturity</h3>
          <div className="relative">
            <div className="absolute left-6 top-6 bottom-6 w-0.5 bg-slate-200" />
            <div className="space-y-8 relative">
              <div className="flex items-start gap-4">
                <div className="w-12 h-12 rounded-full bg-orange-100 flex items-center justify-center shrink-0 border-4 border-white shadow-sm z-10">
                  <Flag className="text-orange-600" size={20} />
                </div>
                <div>
                  <h4 className="font-semibold text-slate-900">Top Level Goals</h4>
                  <p className="text-sm text-slate-500 mt-1">3 Strategic Pillars Defined</p>
                </div>
              </div>
              <div className="flex items-start gap-4">
                <div className="w-12 h-12 rounded-full bg-purple-100 flex items-center justify-center shrink-0 border-4 border-white shadow-sm z-10">
                  <Target className="text-purple-600" size={20} />
                </div>
                <div>
                  <h4 className="font-semibold text-slate-900">Product Needs</h4>
                  <p className="text-sm text-slate-500 mt-1">{needs.length} Needs Identified</p>
                </div>
              </div>
              <div className="flex items-start gap-4">
                <div className="w-12 h-12 rounded-full bg-teal-100 flex items-center justify-center shrink-0 border-4 border-white shadow-sm z-10">
                  <Compass className="text-teal-600" size={20} />
                </div>
                <div>
                  <h4 className="font-semibold text-slate-900">Concept of Operations</h4>
                  <p className="text-sm text-slate-500 mt-1">{conops.length} Scenarios Defined</p>
                </div>
              </div>
              <div className="flex items-start gap-4">
                <div className="w-12 h-12 rounded-full bg-blue-100 flex items-center justify-center shrink-0 border-4 border-white shadow-sm z-10">
                  <FileText className="text-blue-600" size={20} />
                </div>
                <div>
                  <h4 className="font-semibold text-slate-900">System Requirements</h4>
                  <p className="text-sm text-slate-500 mt-1">{requirements.length} Requirements Generated</p>
                </div>
              </div>
            </div>
          </div>
        </Card>

        <Card className="p-6">
          <h3 className="text-lg font-semibold text-slate-800 mb-4">Quick Health Check</h3>
          <div className="space-y-4">
             <div className="bg-slate-50 p-4 rounded-lg border border-slate-100">
               <span className="text-sm text-slate-500">Orphan Requirements</span>
               <div className="flex justify-between items-end mt-1">
                 <span className="text-2xl font-bold text-slate-900">
                   {requirements.filter(r => !r.parentId && !r.sourceNeedId && !r.sourceConOpsId).length}
                 </span>
                 <span className="text-xs text-red-500 font-medium">Needs Attention</span>
               </div>
             </div>
             
             <div className="bg-slate-50 p-4 rounded-lg border border-slate-100">
               <span className="text-sm text-slate-500">Unverified Safety Reqs</span>
               <div className="flex justify-between items-end mt-1">
                 <span className="text-2xl font-bold text-slate-900">
                   {requirements.filter(r => r.type === 'Safety' && r.verificationStatus !== 'Verified').length}
                 </span>
                 <span className="text-xs text-amber-500 font-medium">Critical</span>
               </div>
             </div>
          </div>
        </Card>
      </div>
    </div>
  );
};

const ComplianceView = ({ library, needs, onAddNeed }) => {
  const [filterCategory, setFilterCategory] = useState('All');

  const isActivated = (regCode) => needs.some(n => n.title.includes(regCode));

  const activateRegulation = (reg) => {
    if (isActivated(reg.code)) return;
    const newId = getNextId(needs, 'REG-');
    onAddNeed({
      id: newId,
      title: `${reg.code}: ${reg.title}`,
      source: reg.source.includes('FAA') ? 'Regulatory (FAA)' : 'Regulatory (EASA)',
      text: reg.text,
      linkedGoalId: 'GOAL-02'
    });
  };

  const filteredLibrary = library.filter(reg => {
    if (filterCategory === 'All') return true;
    return reg.category === filterCategory;
  });

  return (
    <div className="space-y-6">
      <div className="bg-white p-6 rounded-xl shadow-sm border border-slate-200">
        <div className="flex flex-col md:flex-row justify-between md:items-center gap-4">
          <div>
            <div className="flex items-center gap-3 mb-2">
              <Scale className="text-slate-800" size={28} />
              <h2 className="text-2xl font-bold text-slate-900">Compliance Library</h2>
            </div>
            <p className="text-slate-600 max-w-2xl text-sm">
              Central repository for applicable FAA and EASA regulations.
            </p>
          </div>
          <div className="flex items-center gap-2 bg-slate-50 p-1.5 rounded-lg border border-slate-200">
            <Filter size={16} className="text-slate-500 ml-2" />
            <select 
              value={filterCategory}
              onChange={(e) => setFilterCategory(e.target.value)}
              className="bg-transparent border-none text-sm font-medium text-slate-700 focus:ring-0 cursor-pointer"
            >
              <option value="All">All Regulations</option>
              <option value="Standard">Standard (FAR/CS)</option>
              <option value="Non-Standard">Non-Standard (AC/Policy)</option>
            </select>
          </div>
        </div>
      </div>

      <Card className="overflow-hidden">
        <div className="overflow-x-auto">
          <table className="min-w-full text-left text-sm">
            <thead className="bg-slate-50 text-slate-600 font-medium border-b border-slate-200">
              <tr>
                <th className="px-6 py-4">Code / Document</th>
                <th className="px-6 py-4">Title & Description</th>
                <th className="px-6 py-4">Category</th>
                <th className="px-6 py-4 text-right">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {filteredLibrary.map((reg, idx) => {
                const active = isActivated(reg.code);
                return (
                  <tr key={idx} className={`hover:bg-slate-50 transition-colors ${active ? 'bg-slate-50/50' : ''}`}>
                    <td className="px-6 py-4">
                      <div className="font-mono font-bold text-slate-700">{reg.code}</div>
                      <div className="text-xs text-slate-400 mt-1">{reg.source}</div>
                    </td>
                    <td className="px-6 py-4 max-w-md">
                      <div className="font-medium text-slate-900">{reg.title}</div>
                      <div className="text-xs text-slate-500 mt-1 line-clamp-2">{reg.text}</div>
                    </td>
                    <td className="px-6 py-4">
                      <Badge color={reg.category === 'Standard' ? 'blue' : 'orange'}>{reg.category}</Badge>
                    </td>
                    <td className="px-6 py-4 text-right">
                      {active ? (
                        <span className="inline-flex items-center gap-1 text-green-600 font-medium text-xs px-3 py-1 bg-green-50 rounded-full border border-green-100">
                          <CheckCircle size={14} /> Active
                        </span>
                      ) : (
                        <button
                          onClick={() => activateRegulation(reg)}
                          className="inline-flex items-center gap-2 px-3 py-1.5 bg-white border border-slate-300 hover:border-blue-400 hover:text-blue-600 text-slate-600 rounded-lg text-xs font-medium transition-all shadow-sm"
                        >
                          <Plus size={14} /> Add to Project
                        </button>
                      )}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </Card>
    </div>
  );
};

const NeedsView = ({ needs, goals, onAdd, onDelete, onEdit }) => {
  const [isAdding, setIsAdding] = useState(false);
  const [editingNeed, setEditingNeed] = useState(null);
  const [showRegModal, setShowRegModal] = useState(false);
  const [source, setSource] = useState('Customer');
  const [title, setTitle] = useState('');
  const [text, setText] = useState('');
  const [linkedGoalId, setLinkedGoalId] = useState('');

  const generatedId = useMemo(() => {
    const prefix = source === 'Customer' ? 'CUST-' : source.includes('Regulatory') ? 'REG-' : 'MKT-';
    return getNextId(needs, prefix);
  }, [needs, source]);

  const handleEdit = (need) => {
    setEditingNeed(need);
    setTitle(need.title);
    setSource(need.source);
    setText(need.text);
    setLinkedGoalId(need.linkedGoalId || '');
    setIsAdding(true);
  };

  const handleSave = (e) => {
    e.preventDefault();
    if (editingNeed) {
      onEdit({ ...editingNeed, title, source, text, linkedGoalId });
      setEditingNeed(null);
    } else {
      onAdd({ id: generatedId, title, source, text, linkedGoalId });
    }
    setIsAdding(false);
    resetForm();
  };

  const resetForm = () => {
    setTitle('');
    setText('');
    setSource('Customer');
    setLinkedGoalId('');
    setEditingNeed(null);
  };

  const importRegulation = (reg) => {
    const newId = getNextId(needs, 'REG-');
    onAdd({
      id: newId,
      title: `${reg.code}: ${reg.title}`,
      source: reg.source.includes('FAA') ? 'Regulatory (FAA)' : 'Regulatory (EASA)',
      text: reg.text,
      linkedGoalId: 'GOAL-02'
    });
    setShowRegModal(false);
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center bg-white p-4 rounded-xl shadow-sm border border-slate-200 gap-4">
        <div>
          <h2 className="text-lg font-semibold text-slate-900">1. Product Needs</h2>
          <p className="text-sm text-slate-500">Stakeholder and Regulatory Constraints</p>
        </div>
        <div className="flex gap-2">
           <button onClick={() => setShowRegModal(true)} className="inline-flex items-center px-4 py-2 border border-slate-300 text-sm font-medium rounded-lg shadow-sm text-slate-700 bg-white hover:bg-slate-50">
            <BookOpen className="h-4 w-4 mr-2" /> Import Regs
          </button>
          <button onClick={() => setIsAdding(true)} className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-lg shadow-sm text-white bg-purple-600 hover:bg-purple-700">
            <Plus className="h-4 w-4 mr-2" /> Add Need
          </button>
        </div>
      </div>

      {isAdding && (
        <Card className="p-6 border-purple-200 ring-2 ring-purple-50">
          <h3 className="text-md font-bold text-slate-800 mb-4">{editingNeed ? 'Edit Product Need' : 'Define New Product Need'}</h3>
          <form onSubmit={handleSave} className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">Source</label>
              <select value={source} onChange={e => setSource(e.target.value)} className="w-full p-2 border border-slate-300 rounded-lg">
                <option>Customer</option>
                <option>Regulatory (FAA)</option>
                <option>Regulatory (EASA)</option>
                <option>Market Research</option>
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">ID {editingNeed ? '' : '(Auto-Generated)'}</label>
              <input value={editingNeed ? editingNeed.id : generatedId} readOnly className="w-full p-2 border border-slate-200 bg-slate-50 text-slate-500 rounded-lg font-mono" />
            </div>
            <div className="md:col-span-2">
              <label className="block text-sm font-medium text-slate-700 mb-1">Align with Top Goal</label>
              <select value={linkedGoalId} onChange={e => setLinkedGoalId(e.target.value)} className="w-full p-2 border border-orange-200 bg-orange-50 rounded-lg">
                <option value="">-- Select Alignment --</option>
                {goals.map(g => <option key={g.id} value={g.id}>{g.title}</option>)}
              </select>
            </div>
            <div className="md:col-span-2">
              <label className="block text-sm font-medium text-slate-700 mb-1">Title</label>
              <input required value={title} onChange={e => setTitle(e.target.value)} className="w-full p-2 border border-slate-300 rounded-lg" />
            </div>
            <div className="md:col-span-2">
              <label className="block text-sm font-medium text-slate-700 mb-1">Description</label>
              <textarea required value={text} onChange={e => setText(e.target.value)} rows={2} className="w-full p-2 border border-slate-300 rounded-lg" />
            </div>
            <div className="md:col-span-2 flex justify-end gap-2">
              <button type="button" onClick={() => { setIsAdding(false); resetForm(); }} className="px-4 py-2 text-slate-600 hover:bg-slate-100 rounded-lg">Cancel</button>
              <button type="submit" className="px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700">{editingNeed ? 'Update Need' : 'Save Need'}</button>
            </div>
          </form>
        </Card>
      )}

      {showRegModal && (
        <div className="fixed inset-0 z-50 overflow-y-auto bg-slate-900/50 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white rounded-xl shadow-xl w-full max-w-3xl overflow-hidden max-h-[80vh] flex flex-col">
            <div className="bg-slate-50 px-6 py-4 border-b border-slate-200 flex justify-between items-center shrink-0">
              <h3 className="text-lg font-bold text-slate-900 flex items-center gap-2"><BookOpen size={20} className="text-purple-600"/> Import Regulation</h3>
              <button onClick={() => setShowRegModal(false)}><X size={24} className="text-slate-400" /></button>
            </div>
            <div className="p-6 overflow-y-auto">
              <div className="grid gap-3">
                {REGULATORY_LIBRARY.map((reg, idx) => (
                  <div key={idx} className="flex items-start justify-between p-4 border border-slate-200 rounded-lg hover:bg-slate-50">
                    <div className="pr-4">
                      <div className="flex items-center gap-2 mb-1">
                        <span className="font-mono font-bold text-slate-800">{reg.code}</span>
                        <Badge color={reg.source.includes('EASA') ? 'indigo' : 'blue'}>{reg.source}</Badge>
                      </div>
                      <h4 className="font-medium text-slate-900 text-sm mb-1">{reg.title}</h4>
                      <p className="text-xs text-slate-500 line-clamp-2">{reg.text}</p>
                    </div>
                    <button onClick={() => importRegulation(reg)} className="shrink-0 p-2 text-purple-600 hover:bg-purple-100 rounded-full"><Download size={20} /></button>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      )}

      <div className="grid grid-cols-1 gap-4">
        {needs.map(need => {
          const linkedGoal = goals.find(g => g.id === need.linkedGoalId);
          return (
            <Card key={need.id} className="p-5 flex flex-col md:flex-row gap-4 items-start border-l-4 border-l-purple-500">
              <div className="flex-1">
                 <div className="flex items-center gap-3 mb-2">
                   <span className="font-mono text-sm font-bold text-purple-700 bg-purple-50 px-2 py-1 rounded">{need.id}</span>
                   <h4 className="text-lg font-semibold text-slate-900">{need.title}</h4>
                   <Badge color="purple">{need.source}</Badge>
                 </div>
                 <p className="text-slate-700 mb-3">{need.text}</p>
                 {linkedGoal && <div className="inline-flex items-center gap-2 px-2 py-1 bg-orange-50 border border-orange-100 rounded text-xs text-orange-800"><Flag size={12} /><span>Supports Goal: <strong>{linkedGoal.title}</strong></span></div>}
              </div>
              <div className="flex gap-2">
                <button onClick={() => handleEdit(need)} className="text-slate-400 hover:text-blue-600 p-2"><Edit size={18} /></button>
                <button onClick={() => onDelete(need.id)} className="text-slate-400 hover:text-red-500 p-2"><Trash2 size={18} /></button>
              </div>
            </Card>
          );
        })}
      </div>
    </div>
  );
};

const ConOpsView = ({ conops, needs, onAdd, onDelete, onEdit }) => {
  const [isAdding, setIsAdding] = useState(false);
  const [editingConOps, setEditingConOps] = useState(null);
  const [newItem, setNewItem] = useState({ title: '', phase: 'Cruise', text: '', linkedNeedId: '' });
  const generatedId = useMemo(() => getNextId(conops, 'OPS-'), [conops]);

  const handleEdit = (conop) => {
    setEditingConOps(conop);
    setNewItem({
      title: conop.title,
      phase: conop.phase,
      text: conop.text,
      linkedNeedId: conop.linkedNeedId || ''
    });
    setIsAdding(true);
  };

  const handleSave = (e) => {
    e.preventDefault();
    if (editingConOps) {
      onEdit({ ...editingConOps, ...newItem });
      setEditingConOps(null);
    } else {
      onAdd({ ...newItem, id: generatedId });
    }
    setIsAdding(false);
    setNewItem({ title: '', phase: 'Cruise', text: '', linkedNeedId: '' });
  };

  const handleCancel = () => {
    setIsAdding(false);
    setEditingConOps(null);
    setNewItem({ title: '', phase: 'Cruise', text: '', linkedNeedId: '' });
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center bg-white p-4 rounded-xl shadow-sm border border-slate-200">
        <div>
          <h2 className="text-lg font-semibold text-slate-900">2. Concept of Operations</h2>
          <p className="text-sm text-slate-500">Operational Scenarios, Use Cases, and Phases.</p>
        </div>
        <button onClick={() => setIsAdding(true)} className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-lg shadow-sm text-white bg-teal-600 hover:bg-teal-700">
          <Plus className="h-4 w-4 mr-2" /> Add Scenario
        </button>
      </div>

      {isAdding && (
        <Card className="p-6 border-teal-200 ring-2 ring-teal-50">
          <h3 className="text-md font-bold text-slate-800 mb-4">{editingConOps ? 'Edit Operational Scenario' : 'Define Operational Scenario'}</h3>
          <form onSubmit={handleSave} className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">ID {editingConOps ? '' : '(Auto)'}</label>
              <input value={editingConOps ? editingConOps.id : generatedId} readOnly className="w-full p-2 border border-slate-200 bg-slate-50 text-slate-500 font-mono rounded-lg" />
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">Flight Phase</label>
              <select value={newItem.phase} onChange={e => setNewItem({...newItem, phase: e.target.value})} className="w-full p-2 border border-slate-300 rounded-lg">
                <option>Taxi</option><option>Takeoff</option><option>Climb</option><option>Cruise</option><option>Descent</option><option>Landing</option><option>Maintenance</option>
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">Satisfies Need (Optional)</label>
              <select value={newItem.linkedNeedId} onChange={e => setNewItem({...newItem, linkedNeedId: e.target.value})} className="w-full p-2 border border-slate-300 rounded-lg">
                <option value="">-- None --</option>
                {needs.map(n => <option key={n.id} value={n.id}>{n.id}: {n.title}</option>)}
              </select>
            </div>
            <div className="md:col-span-2">
              <label className="block text-sm font-medium text-slate-700 mb-1">Scenario Title</label>
              <input required value={newItem.title} onChange={e => setNewItem({...newItem, title: e.target.value})} className="w-full p-2 border border-slate-300 rounded-lg" />
            </div>
            <div className="md:col-span-2">
              <label className="block text-sm font-medium text-slate-700 mb-1">Description</label>
              <textarea required value={newItem.text} onChange={e => setNewItem({...newItem, text: e.target.value})} rows={2} className="w-full p-2 border border-slate-300 rounded-lg" />
            </div>
            <div className="md:col-span-2 flex justify-end gap-2">
              <button type="button" onClick={handleCancel} className="px-4 py-2 text-slate-600 hover:bg-slate-100 rounded-lg">Cancel</button>
              <button type="submit" className="px-4 py-2 bg-teal-600 text-white rounded-lg hover:bg-teal-700">{editingConOps ? 'Update Scenario' : 'Save Scenario'}</button>
            </div>
          </form>
        </Card>
      )}

      <div className="grid grid-cols-1 gap-4">
        {conops.map(item => {
          const linkedNeed = needs.find(n => n.id === item.linkedNeedId);
          return (
            <Card key={item.id} className="p-5 flex flex-col md:flex-row gap-4 items-start border-l-4 border-l-teal-500">
              <div className="flex-1">
                 <div className="flex items-center gap-3 mb-2">
                   <span className="font-mono text-sm font-bold text-teal-700 bg-teal-50 px-2 py-1 rounded">{item.id}</span>
                   <h4 className="text-lg font-semibold text-slate-900">{item.title}</h4>
                   <Badge color="teal">{item.phase}</Badge>
                 </div>
                 <p className="text-slate-700 mb-2">{item.text}</p>
                 {linkedNeed && <div className="flex items-center gap-2 text-sm text-slate-500 mt-3 pt-3 border-t border-slate-100"><ArrowRight size={14} /><span>Satisfies:</span><span className="bg-purple-50 text-purple-700 px-2 py-0.5 rounded font-mono text-xs">{linkedNeed.id}</span></div>}
              </div>
              <div className="flex gap-2">
                <button onClick={() => handleEdit(item)} className="text-slate-400 hover:text-blue-600 p-2"><Edit size={18} /></button>
                <button onClick={() => onDelete(item.id)} className="text-slate-400 hover:text-red-500 p-2"><Trash2 size={18} /></button>
              </div>
            </Card>
          );
        })}
      </div>
    </div>
  );
};

const RequirementsView = ({ requirements, needs, conops, onEdit, onDelete, onAdd, onStatusChange, onLinkArtifact }) => {
  const [searchTerm, setSearchTerm] = useState('');
  
  const filteredReqs = requirements.filter(req => 
    req.title.toLowerCase().includes(searchTerm.toLowerCase()) || 
    req.text.toLowerCase().includes(searchTerm.toLowerCase()) ||
    req.id.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center bg-white p-4 rounded-xl shadow-sm border border-slate-200">
        <div>
          <h2 className="text-lg font-semibold text-slate-900">3. Requirements</h2>
          <p className="text-sm text-slate-500">Functional & Technical Specifications</p>
        </div>
        <div className="flex gap-2">
          <input type="text" className="hidden sm:block pl-3 pr-3 py-2 border border-slate-300 rounded-lg bg-slate-50 text-sm focus:outline-none focus:ring-1 focus:ring-blue-500" placeholder="Search reqs..." value={searchTerm} onChange={(e) => setSearchTerm(e.target.value)} />
          <button onClick={onAdd} className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-lg shadow-sm text-white bg-blue-600 hover:bg-blue-700"><Plus className="h-4 w-4 mr-2" /> New Req</button>
        </div>
      </div>

      <div className="space-y-4">
        {filteredReqs.map(req => (
          <Card key={req.id} className="p-0 overflow-hidden hover:shadow-md transition-shadow border-l-4 border-l-blue-500">
            <div className="p-5">
              <div className="flex justify-between items-start">
                <div className="flex items-center gap-3">
                  <span className="font-mono text-sm font-bold text-slate-600 bg-slate-100 px-2 py-1 rounded">{req.id}</span>
                  <h4 className="text-lg font-semibold text-slate-900">{req.title}</h4>
                  <Badge color={req.type === 'Safety' ? 'red' : 'blue'}>{req.type}</Badge>
                </div>
                <div className="flex items-center gap-2">
                  <button onClick={() => onEdit(req)} className="p-1 text-slate-400 hover:text-blue-600 transition-colors"><Edit size={18} /></button>
                  <button onClick={() => onDelete(req.id)} className="p-1 text-slate-400 hover:text-red-600 transition-colors"><Trash2 size={18} /></button>
                </div>
              </div>
              
              <p className="mt-3 text-slate-700 leading-relaxed font-medium">{req.text}</p>
              
              <div className="mt-5 flex flex-wrap gap-y-3 gap-x-6 pt-4 border-t border-slate-100 text-sm">
                <div className="flex gap-4 mr-auto w-full md:w-auto mb-2 md:mb-0">
                   {req.sourceNeedId && <div className="flex items-center gap-1 text-purple-700"><Target size={14} /><span className="font-mono text-xs">{req.sourceNeedId}</span></div>}
                   {req.sourceConOpsId && <div className="flex items-center gap-1 text-teal-700"><Compass size={14} /><span className="font-mono text-xs">{req.sourceConOpsId}</span></div>}
                   {req.parentId && <div className="flex items-center gap-1 text-blue-700"><LinkIcon size={14} /><span className="font-mono text-xs">{req.parentId}</span></div>}
                </div>

                {/* Validation Dropdown */}
                <div className="flex items-center gap-2 relative group">
                  <span className="text-slate-500">Val:</span>
                  <div className="relative">
                    <select
                      value={req.validationStatus}
                      onChange={(e) => onStatusChange(req.id, 'validationStatus', e.target.value)}
                      className={`appearance-none pl-2 pr-6 py-0.5 rounded text-xs font-medium border cursor-pointer focus:outline-none focus:ring-1 focus:ring-blue-500 ${
                        req.validationStatus === 'Validated' ? 'bg-blue-100 text-blue-800 border-blue-200' :
                        req.validationStatus === 'In Review' ? 'bg-green-100 text-green-800 border-green-200' :
                        'bg-slate-100 text-slate-800 border-slate-200'
                      }`}
                    >
                      <option value="Draft">Draft</option>
                      <option value="In Review">In Review</option>
                      <option value="Validated">Validated</option>
                    </select>
                    <ChevronDown size={12} className="absolute right-1 top-1.5 pointer-events-none text-current opacity-70" />
                  </div>
                  <button onClick={() => onLinkArtifact(req.id, 'validation')} className={`p-1 rounded hover:bg-slate-100 transition-colors ${req.validationArtifact ? 'text-blue-600' : 'text-slate-300 hover:text-slate-500'}`} title={req.validationArtifact ? `Linked: ${req.validationArtifact}` : "Link Validation Artifact"}><Paperclip size={14} /></button>
                </div>

                {/* Verification Dropdown */}
                <div className="flex items-center gap-2 relative group">
                  <span className="text-slate-500">Ver:</span>
                  <div className="relative">
                    <select
                      value={req.verificationStatus}
                      onChange={(e) => onStatusChange(req.id, 'verificationStatus', e.target.value)}
                      className={`appearance-none pl-2 pr-6 py-0.5 rounded text-xs font-medium border cursor-pointer focus:outline-none focus:ring-1 focus:ring-blue-500 ${
                        req.verificationStatus === 'Verified' ? 'bg-blue-100 text-blue-800 border-blue-200' :
                        req.verificationStatus === 'In Progress' ? 'bg-green-100 text-green-800 border-green-200' :
                        req.verificationStatus === 'Failed' ? 'bg-red-100 text-red-800 border-red-200' :
                        'bg-slate-100 text-slate-800 border-slate-200'
                      }`}
                    >
                      <option value="Open">Open</option>
                      <option value="In Progress">In Progress</option>
                      <option value="Verified">Verified</option>
                      <option value="Failed">Failed</option>
                    </select>
                    <ChevronDown size={12} className="absolute right-1 top-1.5 pointer-events-none text-current opacity-70" />
                  </div>
                  <button onClick={() => onLinkArtifact(req.id, 'verification')} className={`p-1 rounded hover:bg-slate-100 transition-colors ${req.verificationArtifact ? 'text-blue-600' : 'text-slate-300 hover:text-slate-500'}`} title={req.verificationArtifact ? `Linked: ${req.verificationArtifact}` : "Link Verification Artifact"}><Paperclip size={14} /></button>
                </div>
              </div>
            </div>
          </Card>
        ))}
      </div>
    </div>
  );
};

const TraceabilityView = ({ requirements, needs, conops, goals }) => {
  return (
    <div className="space-y-6">
      <Card className="p-6">
        <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
          <LinkIcon className="text-slate-400" size={20} />
          4. Traceability Matrix
        </h3>
        <p className="text-sm text-slate-500 mb-6">Showing flow from Top Goal → Need → ConOps → Requirement</p>
        
        <div className="overflow-x-auto">
          <table className="min-w-full text-sm text-left">
            <thead className="bg-slate-50 text-slate-600 font-medium border-b border-slate-200">
              <tr>
                <th className="px-4 py-3 w-1/6">Top Goal</th>
                <th className="px-4 py-3 w-1/6">Product Need</th>
                <th className="px-4 py-3 w-1/6">ConOps Scenario</th>
                <th className="px-4 py-3 w-1/4">Requirement</th>
                <th className="px-4 py-3 text-right">Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {requirements.map(req => {
                const conopsItem = conops.find(c => c.id === req.sourceConOpsId);
                const needItem = needs.find(n => n.id === req.sourceNeedId || (conopsItem && n.id === conopsItem.linkedNeedId));
                const parentReq = requirements.find(p => p.id === req.parentId);
                const goalItem = needItem ? goals.find(g => g.id === needItem.linkedGoalId) : null;
                const isOrphan = !conopsItem && !needItem && !parentReq;

                return (
                  <tr key={req.id} className="hover:bg-slate-50">
                    <td className="px-4 py-3 font-mono text-xs align-top">
                      {goalItem ? ( <div className="flex flex-col gap-1"><Badge color="orange">{goalItem.title}</Badge></div> ) : <span className="text-slate-300">--</span>}
                    </td>
                    <td className="px-4 py-3 font-mono text-xs align-top">
                      {needItem ? ( <div className="p-2 bg-purple-50 rounded border border-purple-100 text-purple-900"><strong>{needItem.id}</strong><div className="truncate w-24 text-[10px] text-purple-700">{needItem.title}</div></div> ) : <span className="text-slate-300">--</span>}
                    </td>
                    <td className="px-4 py-3 font-mono text-xs align-top">
                      {conopsItem ? ( <div className="p-2 bg-teal-50 rounded border border-teal-100 text-teal-900"><strong>{conopsItem.id}</strong><div className="truncate w-24 text-[10px] text-teal-700">{conopsItem.title}</div></div> ) : <span className="text-slate-300">--</span>}
                    </td>
                    <td className="px-4 py-3 font-mono text-xs align-top">
                       <div className="p-2 bg-blue-50 rounded border border-blue-100 text-blue-900"><strong>{req.id}</strong><div className="truncate w-32 text-[10px] text-blue-700">{req.title}</div></div>
                       {parentReq && <div className="mt-1 text-[10px] text-slate-400">Child of {parentReq.id}</div>}
                    </td>
                    <td className="px-4 py-3 text-right align-middle">
                      {isOrphan ? <Badge color="red">Orphan</Badge> : <Badge color="green">Linked</Badge>}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </Card>
    </div>
  );
};

// ==========================================
// 4. MODALS & FORMS
// ==========================================

const RequirementModal = ({ isOpen, onClose, onSave, initialData, existingRequirements, needs, conops }) => {
  const [formData, setFormData] = useState({
    id: '', title: '', text: '', type: 'Functional', criticality: 'DAL C',
    verificationMethod: 'Test', validationStatus: 'Draft', verificationStatus: 'Open',
    parentId: '', sourceNeedId: '', sourceConOpsId: ''
  });

  useEffect(() => {
    if (initialData) {
      setFormData(initialData);
    } else {
      const nextId = getNextId(existingRequirements, 'SYS-');
      setFormData(prev => ({ ...prev, id: nextId }));
    }
  }, [initialData, existingRequirements]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-slate-900/50 backdrop-blur-sm flex items-center justify-center p-4">
      <div className="bg-white rounded-xl shadow-xl w-full max-w-2xl overflow-hidden">
        <div className="bg-slate-50 px-6 py-4 border-b border-slate-200 flex justify-between items-center">
          <h3 className="text-lg font-bold text-slate-900">{initialData ? 'Edit Requirement' : 'New Requirement'}</h3>
          <button onClick={onClose}><X size={24} className="text-slate-400" /></button>
        </div>
        
        <form onSubmit={(e) => { e.preventDefault(); onSave(formData); }} className="p-6 space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">Requirement ID</label>
              <input required name="id" value={formData.id} onChange={handleChange} disabled={!!initialData} className="w-full p-2 border border-slate-300 bg-slate-50 font-mono rounded-lg" />
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">Title</label>
              <input required name="title" value={formData.title} onChange={handleChange} className="w-full p-2 border border-slate-300 rounded-lg" />
            </div>
          </div>

          <div className="grid grid-cols-3 gap-4 bg-slate-50 p-3 rounded-lg border border-slate-200">
             <div className="col-span-3 text-xs font-bold text-slate-500 uppercase tracking-wider mb-1">Traceability Sources</div>
             <div>
               <label className="block text-xs font-medium text-slate-700 mb-1">Parent Req</label>
               <select name="parentId" value={formData.parentId} onChange={handleChange} className="w-full p-2 text-sm border border-slate-300 rounded-lg">
                 <option value="">None</option>
                 {existingRequirements.filter(r => r.id !== formData.id).map(r => <option key={r.id} value={r.id}>{r.id}</option>)}
               </select>
             </div>
             <div>
               <label className="block text-xs font-medium text-slate-700 mb-1">Product Need</label>
               <select name="sourceNeedId" value={formData.sourceNeedId} onChange={handleChange} className="w-full p-2 text-sm border border-purple-300 rounded-lg">
                 <option value="">None</option>
                 {needs.map(n => <option key={n.id} value={n.id}>{n.id}</option>)}
               </select>
             </div>
             <div>
               <label className="block text-xs font-medium text-slate-700 mb-1">ConOps Scenario</label>
               <select name="sourceConOpsId" value={formData.sourceConOpsId} onChange={handleChange} className="w-full p-2 text-sm border border-teal-300 rounded-lg">
                 <option value="">None</option>
                 {conops.map(c => <option key={c.id} value={c.id}>{c.id}</option>)}
               </select>
             </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1">Requirement Text (Shall)</label>
            <textarea required name="text" rows={3} value={formData.text} onChange={handleChange} className="w-full p-2 border border-slate-300 rounded-lg" />
          </div>

          <div className="grid grid-cols-2 gap-4">
             <div>
               <label className="block text-sm font-medium text-slate-700 mb-1">Type</label>
               <select name="type" value={formData.type} onChange={handleChange} className="w-full p-2 border border-slate-300 rounded-lg">
                 <option>Functional</option><option>Performance</option><option>Safety</option><option>Environmental</option>
               </select>
             </div>
             <div>
               <label className="block text-sm font-medium text-slate-700 mb-1">Criticality</label>
               <select name="criticality" value={formData.criticality} onChange={handleChange} className="w-full p-2 border border-slate-300 rounded-lg">
                 <option>DAL A</option><option>DAL B</option><option>DAL C</option><option>DAL D</option>
               </select>
             </div>
          </div>
          
          <div className="flex justify-end gap-3 pt-4 border-t border-slate-100">
            <button type="button" onClick={onClose} className="px-4 py-2 text-slate-600 hover:bg-slate-50 rounded-lg">Cancel</button>
            <button type="submit" className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700">Save</button>
          </div>
        </form>
      </div>
    </div>
  );
};

// ==========================================
// 5. MAIN APP COMPONENT
// ==========================================

function App() {
  const [activeView, setActiveView] = useState('dashboard');
  const [goals] = useState(INITIAL_GOALS);
  const [needs, setNeeds] = useState(INITIAL_NEEDS);
  const [conops, setConops] = useState(INITIAL_CONOPS);
  const [requirements, setRequirements] = useState(INITIAL_REQS);
  const [modalOpen, setModalOpen] = useState(false);
  const [editingReq, setEditingReq] = useState(null);

  const stats = useMemo(() => ({
    total: requirements.length,
    validated: requirements.filter(r => r.validationStatus === 'Validated').length,
    verified: requirements.filter(r => r.verificationStatus === 'Verified').length,
    safetyCritical: requirements.filter(r => r.type === 'Safety' || r.criticality === 'DAL A').length
  }), [requirements]);

  const handleAddRequirement = () => {
    setEditingReq(null);
    setModalOpen(true);
  };

  const handleEditRequirement = (req) => {
    setEditingReq(req);
    setModalOpen(true);
  };

  const handleSaveRequirement = (formData) => {
    if (editingReq) {
      setRequirements(prev => prev.map(r => r.id === formData.id ? { ...formData, lastUpdated: new Date().toISOString().split('T')[0] } : r));
    } else {
      setRequirements(prev => [...prev, { ...formData, lastUpdated: new Date().toISOString().split('T')[0], validationArtifact: null, verificationArtifact: null }]);
    }
    setModalOpen(false);
    setEditingReq(null);
  };

  const handleDeleteRequirement = (id) => {
    if (window.confirm('Delete this requirement?')) {
      setRequirements(prev => prev.filter(r => r.id !== id));
    }
  };

  const handleStatusChange = (id, field, value) => {
    setRequirements(prev => prev.map(r => r.id === id ? { ...r, [field]: value, lastUpdated: new Date().toISOString().split('T')[0] } : r));
  };

  const handleLinkArtifact = (id, type) => {
    const artifactName = prompt(`Enter ${type} artifact name/link:`);
    if (artifactName) {
      const field = type === 'validation' ? 'validationArtifact' : 'verificationArtifact';
      setRequirements(prev => prev.map(r => r.id === id ? { ...r, [field]: artifactName } : r));
    }
  };

  return (
    <div className="min-h-screen bg-slate-50">
      <nav className="bg-gradient-to-r from-slate-900 via-slate-800 to-slate-900 shadow-lg sticky top-0 z-40">
        <div className="max-w-7xl mx-auto px-4">
          <div className="flex items-center justify-between h-16">
            <div className="flex items-center space-x-3">
              <Rocket className="text-white h-8 w-8" />
              <div>
                <h1 className="text-white text-xl font-bold tracking-tight">AeroReqs</h1>
                <p className="text-slate-400 text-xs">Requirements Management Suite</p>
              </div>
            </div>
            <div className="flex items-center space-x-2 overflow-x-auto">
              <NavButton active={activeView === 'dashboard'} onClick={() => setActiveView('dashboard')} icon={<LayoutDashboard size={18} />} label="Dashboard" />
              <NavButton active={activeView === 'compliance'} onClick={() => setActiveView('compliance')} icon={<Scale size={18} />} label="Compliance" />
              <NavButton active={activeView === 'needs'} onClick={() => setActiveView('needs')} icon={<Target size={18} />} label="Needs" />
              <NavButton active={activeView === 'conops'} onClick={() => setActiveView('conops')} icon={<Compass size={18} />} label="ConOps" />
              <NavButton active={activeView === 'requirements'} onClick={() => setActiveView('requirements')} icon={<FileText size={18} />} label="Requirements" />
              <NavButton active={activeView === 'traceability'} onClick={() => setActiveView('traceability')} icon={<LinkIcon size={18} />} label="Traceability" />
            </div>
          </div>
        </div>
      </nav>

      <main className="max-w-7xl mx-auto px-4 py-8">
        {activeView === 'dashboard' && <DashboardView stats={stats} requirements={requirements} needs={needs} conops={conops} goals={goals} />}
        {activeView === 'compliance' && <ComplianceView library={REGULATORY_LIBRARY} needs={needs} onAddNeed={(n) => setNeeds(prev => [...prev, n])} />}
        {activeView === 'needs' && <NeedsView needs={needs} goals={goals} onAdd={(n) => setNeeds(prev => [...prev, n])} onEdit={(n) => setNeeds(prev => prev.map(item => item.id === n.id ? n : item))} onDelete={(id) => setNeeds(prev => prev.filter(n => n.id !== id))} />}
        {activeView === 'conops' && <ConOpsView conops={conops} needs={needs} onAdd={(c) => setConops(prev => [...prev, c])} onEdit={(c) => setConops(prev => prev.map(item => item.id === c.id ? c : item))} onDelete={(id) => setConops(prev => prev.filter(c => c.id !== id))} />}
        {activeView === 'requirements' && <RequirementsView requirements={requirements} needs={needs} conops={conops} onEdit={handleEditRequirement} onDelete={handleDeleteRequirement} onAdd={handleAddRequirement} onStatusChange={handleStatusChange} onLinkArtifact={handleLinkArtifact} />}
        {activeView === 'traceability' && <TraceabilityView requirements={requirements} needs={needs} conops={conops} goals={goals} />}
      </main>

      <RequirementModal 
        isOpen={modalOpen} 
        onClose={() => { setModalOpen(false); setEditingReq(null); }} 
        onSave={handleSaveRequirement} 
        initialData={editingReq}
        existingRequirements={requirements}
        needs={needs}
        conops={conops}
      />
    </div>
  );
}

export default App;
