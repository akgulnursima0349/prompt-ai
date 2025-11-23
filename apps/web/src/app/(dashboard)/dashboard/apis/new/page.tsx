'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { motion, AnimatePresence } from 'framer-motion';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import {
  Zap,
  ArrowRight,
  ArrowLeft,
  Loader2,
  Sparkles,
  Check,
  Code,
  Settings,
  Key,
  Copy,
  CheckCircle,
  FileText,
  Database,
  MessageSquare,
  Pencil,
  X,
  ChevronDown,
  ChevronUp,
} from 'lucide-react';
import toast from 'react-hot-toast';

type Step = 'prompt' | 'setup' | 'configure' | 'complete';

interface APISetup {
  name: string;
  description: string;
  systemPrompt: string;
  inputSchema: {
    type: string;
    properties: Record<string, { type: string; description: string }>;
    required?: string[];
  };
  outputSchema: {
    type: string;
    properties: Record<string, { type: string; description: string }>;
  };
  exampleInput: Record<string, unknown>;
  exampleOutput: Record<string, unknown>;
  suggestedEndpoint: string;
}

interface SetupStepStatus {
  basicInfo: 'pending' | 'editing' | 'approved';
  systemPrompt: 'pending' | 'editing' | 'approved';
  inputSchema: 'pending' | 'editing' | 'approved';
  outputSchema: 'pending' | 'editing' | 'approved';
}

export default function NewApiPage() {
  const router = useRouter();
  const [step, setStep] = useState<Step>('prompt');
  const [isLoading, setIsLoading] = useState(false);
  const [prompt, setPrompt] = useState('');
  const [setup, setSetup] = useState<APISetup | null>(null);
  const [apiResult, setApiResult] = useState<{ id: string; apiKey: string; endpoint: string } | null>(null);

  // Editable setup fields
  const [editableSetup, setEditableSetup] = useState<APISetup | null>(null);
  const [setupSteps, setSetupSteps] = useState<SetupStepStatus>({
    basicInfo: 'pending',
    systemPrompt: 'pending',
    inputSchema: 'pending',
    outputSchema: 'pending',
  });
  const [expandedSections, setExpandedSections] = useState({
    basicInfo: true,
    systemPrompt: false,
    inputSchema: false,
    outputSchema: false,
  });

  const [config, setConfig] = useState({
    name: '',
    temperature: 0.7,
    maxTokens: 2000,
  });

  const handleGenerateSetup = async () => {
    if (!prompt.trim()) {
      toast.error('Lutfen bir prompt girin');
      return;
    }

    setIsLoading(true);
    try {
      const response = await fetch('/api/generate-setup', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ prompt }),
      });

      if (!response.ok) {
        throw new Error('Setup olusturulamadi');
      }

      const data = await response.json();
      setSetup(data.setup);
      setEditableSetup(data.setup);
      setConfig((prev) => ({ ...prev, name: data.setup.name }));
      setSetupSteps({
        basicInfo: 'pending',
        systemPrompt: 'pending',
        inputSchema: 'pending',
        outputSchema: 'pending',
      });
      setExpandedSections({
        basicInfo: true,
        systemPrompt: false,
        inputSchema: false,
        outputSchema: false,
      });
      setStep('setup');
    } catch (error) {
      toast.error('Bir hata olustu, tekrar deneyin');
    } finally {
      setIsLoading(false);
    }
  };

  const approveStep = (stepName: keyof SetupStepStatus) => {
    setSetupSteps((prev) => ({ ...prev, [stepName]: 'approved' }));

    // Auto-expand next section
    const stepOrder: (keyof SetupStepStatus)[] = ['basicInfo', 'systemPrompt', 'inputSchema', 'outputSchema'];
    const currentIndex = stepOrder.indexOf(stepName);
    if (currentIndex < stepOrder.length - 1) {
      const nextStep = stepOrder[currentIndex + 1];
      setExpandedSections((prev) => ({
        ...prev,
        [stepName]: false,
        [nextStep]: true,
      }));
    } else {
      setExpandedSections((prev) => ({ ...prev, [stepName]: false }));
    }

    toast.success('Onaylandi!');
  };

  const editStep = (stepName: keyof SetupStepStatus) => {
    setSetupSteps((prev) => ({ ...prev, [stepName]: 'editing' }));
    setExpandedSections((prev) => ({ ...prev, [stepName]: true }));
  };

  const cancelEdit = (stepName: keyof SetupStepStatus) => {
    setSetupSteps((prev) => ({ ...prev, [stepName]: 'pending' }));
    // Reset to original
    if (setup) {
      setEditableSetup({ ...setup });
    }
  };

  const allStepsApproved = Object.values(setupSteps).every((s) => s === 'approved');

  const handleCreateAPI = async () => {
    if (!editableSetup) return;

    setIsLoading(true);
    try {
      const response = await fetch('/api/apis', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          prompt,
          setup: {
            ...editableSetup,
            name: config.name,
          },
          config: {
            temperature: config.temperature,
            maxTokens: config.maxTokens,
          },
        }),
      });

      if (!response.ok) {
        throw new Error('API olusturulamadi');
      }

      const data = await response.json();
      setApiResult(data);
      setStep('complete');
      toast.success('API basariyla olusturuldu!');
    } catch (error) {
      toast.error('API olusturulurken hata olustu');
    } finally {
      setIsLoading(false);
    }
  };

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text);
    toast.success('Kopyalandi!');
  };

  const toggleSection = (section: keyof typeof expandedSections) => {
    setExpandedSections((prev) => ({ ...prev, [section]: !prev[section] }));
  };

  const getStepBadge = (status: 'pending' | 'editing' | 'approved') => {
    if (status === 'approved') return <Badge variant="success">Onaylandi</Badge>;
    if (status === 'editing') return <Badge variant="warning">Duzenleniyor</Badge>;
    return <Badge variant="info">Onay Bekliyor</Badge>;
  };

  return (
    <div className="mx-auto max-w-4xl space-y-6">
      {/* Progress Steps */}
      <div className="flex items-center justify-center gap-4">
        {[
          { id: 'prompt', label: 'Prompt', icon: Sparkles },
          { id: 'setup', label: 'Yapilandirma', icon: Settings },
          { id: 'configure', label: 'Ayarlar', icon: Code },
          { id: 'complete', label: 'Tamamlandi', icon: CheckCircle },
        ].map((s, index) => (
          <div key={s.id} className="flex items-center">
            <div className="flex flex-col items-center">
              <div
                className={`flex h-10 w-10 items-center justify-center rounded-full transition-colors ${
                  step === s.id
                    ? 'bg-brand-600 text-white'
                    : ['setup', 'configure', 'complete'].indexOf(step) > ['prompt', 'setup', 'configure', 'complete'].indexOf(s.id)
                    ? 'bg-green-500 text-white'
                    : 'bg-muted text-muted-foreground'
                }`}
              >
                {['setup', 'configure', 'complete'].indexOf(step) > ['prompt', 'setup', 'configure', 'complete'].indexOf(s.id) ? (
                  <Check className="h-5 w-5" />
                ) : (
                  <s.icon className="h-5 w-5" />
                )}
              </div>
              <span className="mt-1 text-xs text-muted-foreground">{s.label}</span>
            </div>
            {index < 3 && (
              <div
                className={`h-1 w-8 md:w-16 mx-2 ${
                  ['setup', 'configure', 'complete'].indexOf(step) > index
                    ? 'bg-brand-600'
                    : 'bg-muted'
                }`}
              />
            )}
          </div>
        ))}
      </div>

      <AnimatePresence mode="wait">
        {/* Step 1: Prompt */}
        {step === 'prompt' && (
          <motion.div
            key="prompt"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
          >
            <Card>
              <CardHeader className="text-center">
                <CardTitle className="text-2xl">API'nizi Tanimlayın</CardTitle>
                <CardDescription>
                  Ne tur bir API istediginizi dogal dilde aciklayın. AI sizin icin en uygun yapilandirmayi olusturacak.
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="space-y-2">
                  <label className="text-sm font-medium">Prompt</label>
                  <Textarea
                    placeholder="Ornek: Musteri yorumlarini analiz edip duygu durumunu belirleyen bir API olustur. Pozitif, negatif veya notr olarak siniflandirsin ve guven skorunu da versin."
                    className="min-h-[200px] resize-none"
                    value={prompt}
                    onChange={(e) => setPrompt(e.target.value)}
                  />
                  <p className="text-xs text-muted-foreground">
                    Ne kadar detayli yazarsaniz, AI o kadar iyi anlayacaktır.
                  </p>
                </div>

                {/* Example Prompts */}
                <div className="space-y-2">
                  <p className="text-sm font-medium">Ornek Promptlar:</p>
                  <div className="flex flex-wrap gap-2">
                    {[
                      'Metin ozetleme API\'si',
                      'Duygu analizi',
                      'Icerik siniflandirma',
                      'Soru-cevap botu',
                      'Ceviri API\'si',
                    ].map((example) => (
                      <Badge
                        key={example}
                        variant="outline"
                        className="cursor-pointer hover:bg-muted"
                        onClick={() => setPrompt(example + ' olustur')}
                      >
                        {example}
                      </Badge>
                    ))}
                  </div>
                </div>

                <Button
                  variant="gradient"
                  className="w-full"
                  size="lg"
                  onClick={handleGenerateSetup}
                  disabled={isLoading || !prompt.trim()}
                >
                  {isLoading ? (
                    <>
                      <Loader2 className="mr-2 h-5 w-5 animate-spin" />
                      AI Analiz Ediyor...
                    </>
                  ) : (
                    <>
                      <Zap className="mr-2 h-5 w-5" />
                      API Yapisini Olustur
                    </>
                  )}
                </Button>
              </CardContent>
            </Card>
          </motion.div>
        )}

        {/* Step 2: Setup Preview - Enhanced */}
        {step === 'setup' && editableSetup && (
          <motion.div
            key="setup"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            className="space-y-4"
          >
            {/* Progress indicator */}
            <Card className="bg-gradient-to-r from-brand-50 to-brand-100 dark:from-brand-950 dark:to-brand-900 border-brand-200 dark:border-brand-800">
              <CardContent className="py-4">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <Sparkles className="h-5 w-5 text-brand-600" />
                    <span className="font-medium">Yapilandirma Adimlari</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="text-sm text-muted-foreground">
                      {Object.values(setupSteps).filter((s) => s === 'approved').length} / 4 Onaylandi
                    </span>
                    <div className="w-24 h-2 bg-muted rounded-full overflow-hidden">
                      <div
                        className="h-full bg-brand-600 transition-all"
                        style={{
                          width: `${(Object.values(setupSteps).filter((s) => s === 'approved').length / 4) * 100}%`,
                        }}
                      />
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Step 1: Basic Info */}
            <Card className={setupSteps.basicInfo === 'approved' ? 'border-green-200 dark:border-green-800' : ''}>
              <CardHeader
                className="cursor-pointer"
                onClick={() => toggleSection('basicInfo')}
              >
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className={`p-2 rounded-lg ${setupSteps.basicInfo === 'approved' ? 'bg-green-100 dark:bg-green-900' : 'bg-blue-100 dark:bg-blue-900'}`}>
                      <FileText className={`h-5 w-5 ${setupSteps.basicInfo === 'approved' ? 'text-green-600' : 'text-blue-600'}`} />
                    </div>
                    <div>
                      <CardTitle className="text-lg">1. Temel Bilgiler</CardTitle>
                      <CardDescription>API adi, aciklamasi ve endpoint</CardDescription>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    {getStepBadge(setupSteps.basicInfo)}
                    {expandedSections.basicInfo ? <ChevronUp className="h-5 w-5" /> : <ChevronDown className="h-5 w-5" />}
                  </div>
                </div>
              </CardHeader>
              {expandedSections.basicInfo && (
                <CardContent className="space-y-4 border-t pt-4">
                  <div className="grid gap-4 md:grid-cols-2">
                    <div className="space-y-2">
                      <label className="text-sm font-medium">API Adi</label>
                      <Input
                        value={config.name}
                        onChange={(e) => setConfig({ ...config, name: e.target.value })}
                        disabled={setupSteps.basicInfo === 'approved'}
                      />
                    </div>
                    <div className="space-y-2">
                      <label className="text-sm font-medium">Endpoint</label>
                      <Input value={`/api/v1/${editableSetup.suggestedEndpoint}`} disabled />
                    </div>
                  </div>
                  <div className="space-y-2">
                    <label className="text-sm font-medium">Aciklama</label>
                    {setupSteps.basicInfo === 'editing' ? (
                      <Textarea
                        value={editableSetup.description}
                        onChange={(e) => setEditableSetup({ ...editableSetup, description: e.target.value })}
                        className="min-h-[80px]"
                      />
                    ) : (
                      <p className="rounded-lg bg-muted p-3 text-sm">{editableSetup.description}</p>
                    )}
                  </div>
                  <div className="flex gap-2 justify-end">
                    {setupSteps.basicInfo === 'approved' ? (
                      <Button variant="outline" size="sm" onClick={() => editStep('basicInfo')}>
                        <Pencil className="mr-2 h-4 w-4" />
                        Duzenle
                      </Button>
                    ) : setupSteps.basicInfo === 'editing' ? (
                      <>
                        <Button variant="outline" size="sm" onClick={() => cancelEdit('basicInfo')}>
                          <X className="mr-2 h-4 w-4" />
                          Iptal
                        </Button>
                        <Button variant="default" size="sm" onClick={() => approveStep('basicInfo')}>
                          <Check className="mr-2 h-4 w-4" />
                          Kaydet ve Onayla
                        </Button>
                      </>
                    ) : (
                      <>
                        <Button variant="outline" size="sm" onClick={() => editStep('basicInfo')}>
                          <Pencil className="mr-2 h-4 w-4" />
                          Duzenle
                        </Button>
                        <Button variant="default" size="sm" onClick={() => approveStep('basicInfo')}>
                          <Check className="mr-2 h-4 w-4" />
                          Onayla
                        </Button>
                      </>
                    )}
                  </div>
                </CardContent>
              )}
            </Card>

            {/* Step 2: System Prompt */}
            <Card className={setupSteps.systemPrompt === 'approved' ? 'border-green-200 dark:border-green-800' : ''}>
              <CardHeader
                className="cursor-pointer"
                onClick={() => toggleSection('systemPrompt')}
              >
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className={`p-2 rounded-lg ${setupSteps.systemPrompt === 'approved' ? 'bg-green-100 dark:bg-green-900' : 'bg-purple-100 dark:bg-purple-900'}`}>
                      <MessageSquare className={`h-5 w-5 ${setupSteps.systemPrompt === 'approved' ? 'text-green-600' : 'text-purple-600'}`} />
                    </div>
                    <div>
                      <CardTitle className="text-lg">2. Sistem Prompt'u</CardTitle>
                      <CardDescription>AI modeline verilecek talimatlar</CardDescription>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    {getStepBadge(setupSteps.systemPrompt)}
                    {expandedSections.systemPrompt ? <ChevronUp className="h-5 w-5" /> : <ChevronDown className="h-5 w-5" />}
                  </div>
                </div>
              </CardHeader>
              {expandedSections.systemPrompt && (
                <CardContent className="space-y-4 border-t pt-4">
                  <div className="space-y-2">
                    <div className="flex items-center justify-between">
                      <label className="text-sm font-medium">Sistem Prompt'u</label>
                      <span className="text-xs text-muted-foreground">
                        Bu metin, AI modeline her istekte gonderilir
                      </span>
                    </div>
                    {setupSteps.systemPrompt === 'editing' ? (
                      <Textarea
                        value={editableSetup.systemPrompt}
                        onChange={(e) => setEditableSetup({ ...editableSetup, systemPrompt: e.target.value })}
                        className="min-h-[200px] font-mono text-sm"
                      />
                    ) : (
                      <div className="rounded-lg bg-muted p-4 font-mono text-sm whitespace-pre-wrap max-h-[300px] overflow-y-auto">
                        {editableSetup.systemPrompt}
                      </div>
                    )}
                  </div>
                  <div className="flex gap-2 justify-end">
                    {setupSteps.systemPrompt === 'approved' ? (
                      <Button variant="outline" size="sm" onClick={() => editStep('systemPrompt')}>
                        <Pencil className="mr-2 h-4 w-4" />
                        Duzenle
                      </Button>
                    ) : setupSteps.systemPrompt === 'editing' ? (
                      <>
                        <Button variant="outline" size="sm" onClick={() => cancelEdit('systemPrompt')}>
                          <X className="mr-2 h-4 w-4" />
                          Iptal
                        </Button>
                        <Button variant="default" size="sm" onClick={() => approveStep('systemPrompt')}>
                          <Check className="mr-2 h-4 w-4" />
                          Kaydet ve Onayla
                        </Button>
                      </>
                    ) : (
                      <>
                        <Button variant="outline" size="sm" onClick={() => editStep('systemPrompt')}>
                          <Pencil className="mr-2 h-4 w-4" />
                          Duzenle
                        </Button>
                        <Button variant="default" size="sm" onClick={() => approveStep('systemPrompt')}>
                          <Check className="mr-2 h-4 w-4" />
                          Onayla
                        </Button>
                      </>
                    )}
                  </div>
                </CardContent>
              )}
            </Card>

            {/* Step 3: Input Schema */}
            <Card className={setupSteps.inputSchema === 'approved' ? 'border-green-200 dark:border-green-800' : ''}>
              <CardHeader
                className="cursor-pointer"
                onClick={() => toggleSection('inputSchema')}
              >
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className={`p-2 rounded-lg ${setupSteps.inputSchema === 'approved' ? 'bg-green-100 dark:bg-green-900' : 'bg-orange-100 dark:bg-orange-900'}`}>
                      <Database className={`h-5 w-5 ${setupSteps.inputSchema === 'approved' ? 'text-green-600' : 'text-orange-600'}`} />
                    </div>
                    <div>
                      <CardTitle className="text-lg">3. Girdi Semasi</CardTitle>
                      <CardDescription>API'ye gonderilecek veri yapisi</CardDescription>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    {getStepBadge(setupSteps.inputSchema)}
                    {expandedSections.inputSchema ? <ChevronUp className="h-5 w-5" /> : <ChevronDown className="h-5 w-5" />}
                  </div>
                </div>
              </CardHeader>
              {expandedSections.inputSchema && (
                <CardContent className="space-y-4 border-t pt-4">
                  <div className="grid gap-4 md:grid-cols-2">
                    <div className="space-y-2">
                      <label className="text-sm font-medium">Girdi Alanlari</label>
                      <div className="rounded-lg border p-3 space-y-2">
                        {Object.entries(editableSetup.inputSchema.properties || {}).map(([key, value]) => (
                          <div key={key} className="flex items-center justify-between text-sm">
                            <div className="flex items-center gap-2">
                              <code className="bg-muted px-2 py-0.5 rounded">{key}</code>
                              <span className="text-muted-foreground">({value.type})</span>
                            </div>
                            {editableSetup.inputSchema.required?.includes(key) && (
                              <Badge variant="outline" className="text-xs">Zorunlu</Badge>
                            )}
                          </div>
                        ))}
                      </div>
                    </div>
                    <div className="space-y-2">
                      <label className="text-sm font-medium">Ornek Girdi</label>
                      <pre className="rounded-lg bg-muted p-3 text-sm overflow-x-auto">
                        {JSON.stringify(editableSetup.exampleInput, null, 2)}
                      </pre>
                    </div>
                  </div>
                  <div className="flex gap-2 justify-end">
                    {setupSteps.inputSchema === 'approved' ? (
                      <Button variant="outline" size="sm" onClick={() => editStep('inputSchema')}>
                        <Pencil className="mr-2 h-4 w-4" />
                        Duzenle
                      </Button>
                    ) : (
                      <Button variant="default" size="sm" onClick={() => approveStep('inputSchema')}>
                        <Check className="mr-2 h-4 w-4" />
                        Onayla
                      </Button>
                    )}
                  </div>
                </CardContent>
              )}
            </Card>

            {/* Step 4: Output Schema */}
            <Card className={setupSteps.outputSchema === 'approved' ? 'border-green-200 dark:border-green-800' : ''}>
              <CardHeader
                className="cursor-pointer"
                onClick={() => toggleSection('outputSchema')}
              >
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className={`p-2 rounded-lg ${setupSteps.outputSchema === 'approved' ? 'bg-green-100 dark:bg-green-900' : 'bg-cyan-100 dark:bg-cyan-900'}`}>
                      <Code className={`h-5 w-5 ${setupSteps.outputSchema === 'approved' ? 'text-green-600' : 'text-cyan-600'}`} />
                    </div>
                    <div>
                      <CardTitle className="text-lg">4. Cikti Semasi</CardTitle>
                      <CardDescription>API'den donecek veri yapisi</CardDescription>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    {getStepBadge(setupSteps.outputSchema)}
                    {expandedSections.outputSchema ? <ChevronUp className="h-5 w-5" /> : <ChevronDown className="h-5 w-5" />}
                  </div>
                </div>
              </CardHeader>
              {expandedSections.outputSchema && (
                <CardContent className="space-y-4 border-t pt-4">
                  <div className="grid gap-4 md:grid-cols-2">
                    <div className="space-y-2">
                      <label className="text-sm font-medium">Cikti Alanlari</label>
                      <div className="rounded-lg border p-3 space-y-2">
                        {Object.entries(editableSetup.outputSchema.properties || {}).map(([key, value]) => (
                          <div key={key} className="flex items-center gap-2 text-sm">
                            <code className="bg-muted px-2 py-0.5 rounded">{key}</code>
                            <span className="text-muted-foreground">({value.type})</span>
                          </div>
                        ))}
                      </div>
                    </div>
                    <div className="space-y-2">
                      <label className="text-sm font-medium">Ornek Cikti</label>
                      <pre className="rounded-lg bg-muted p-3 text-sm overflow-x-auto">
                        {JSON.stringify(editableSetup.exampleOutput, null, 2)}
                      </pre>
                    </div>
                  </div>
                  <div className="flex gap-2 justify-end">
                    {setupSteps.outputSchema === 'approved' ? (
                      <Button variant="outline" size="sm" onClick={() => editStep('outputSchema')}>
                        <Pencil className="mr-2 h-4 w-4" />
                        Duzenle
                      </Button>
                    ) : (
                      <Button variant="default" size="sm" onClick={() => approveStep('outputSchema')}>
                        <Check className="mr-2 h-4 w-4" />
                        Onayla
                      </Button>
                    )}
                  </div>
                </CardContent>
              )}
            </Card>

            {/* Navigation */}
            <div className="flex gap-4 pt-4">
              <Button variant="outline" onClick={() => setStep('prompt')}>
                <ArrowLeft className="mr-2 h-4 w-4" />
                Geri
              </Button>
              <Button
                variant="gradient"
                className="flex-1"
                onClick={() => setStep('configure')}
                disabled={!allStepsApproved}
              >
                {allStepsApproved ? (
                  <>
                    Devam Et
                    <ArrowRight className="ml-2 h-4 w-4" />
                  </>
                ) : (
                  <>
                    Tum Adimlari Onaylayin
                    <span className="ml-2 text-xs">({Object.values(setupSteps).filter((s) => s === 'approved').length}/4)</span>
                  </>
                )}
              </Button>
            </div>
          </motion.div>
        )}

        {/* Step 3: Configure */}
        {step === 'configure' && (
          <motion.div
            key="configure"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
          >
            <Card>
              <CardHeader>
                <CardTitle>Son Ayarlar</CardTitle>
                <CardDescription>
                  API'nizin davranisini ozelleştirin
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="grid gap-6 md:grid-cols-2">
                  <div className="space-y-2">
                    <label className="text-sm font-medium">
                      Temperature: {config.temperature}
                    </label>
                    <input
                      type="range"
                      min="0"
                      max="2"
                      step="0.1"
                      value={config.temperature}
                      onChange={(e) =>
                        setConfig({ ...config, temperature: parseFloat(e.target.value) })
                      }
                      className="w-full accent-brand-600"
                    />
                    <p className="text-xs text-muted-foreground">
                      Dusuk = Daha tutarli, Yuksek = Daha yaratici
                    </p>
                  </div>

                  <div className="space-y-2">
                    <label className="text-sm font-medium">Max Tokens</label>
                    <Input
                      type="number"
                      value={config.maxTokens}
                      onChange={(e) =>
                        setConfig({ ...config, maxTokens: parseInt(e.target.value) })
                      }
                      min={100}
                      max={8000}
                    />
                    <p className="text-xs text-muted-foreground">
                      Maksimum yanit uzunlugu
                    </p>
                  </div>
                </div>

                {/* Summary */}
                <div className="rounded-lg bg-muted/50 p-4 space-y-2">
                  <h4 className="font-medium">Ozet</h4>
                  <div className="grid gap-2 text-sm">
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">API Adi:</span>
                      <span className="font-medium">{config.name}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">Endpoint:</span>
                      <code className="text-xs bg-muted px-2 py-0.5 rounded">/api/v1/{editableSetup?.suggestedEndpoint}</code>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">Model:</span>
                      <span>Llama 3.3 70B</span>
                    </div>
                  </div>
                </div>

                <div className="flex gap-4">
                  <Button variant="outline" onClick={() => setStep('setup')}>
                    <ArrowLeft className="mr-2 h-4 w-4" />
                    Geri
                  </Button>
                  <Button
                    variant="gradient"
                    className="flex-1"
                    onClick={handleCreateAPI}
                    disabled={isLoading}
                  >
                    {isLoading ? (
                      <>
                        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                        Olusturuluyor...
                      </>
                    ) : (
                      <>
                        <Zap className="mr-2 h-4 w-4" />
                        API'yi Olustur
                      </>
                    )}
                  </Button>
                </div>
              </CardContent>
            </Card>
          </motion.div>
        )}

        {/* Step 4: Complete */}
        {step === 'complete' && apiResult && (
          <motion.div
            key="complete"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
          >
            <Card>
              <CardHeader className="text-center">
                <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-green-100 dark:bg-green-900">
                  <CheckCircle className="h-8 w-8 text-green-600" />
                </div>
                <CardTitle className="text-2xl">API Hazir!</CardTitle>
                <CardDescription>
                  API'niz basariyla olusturuldu ve kullanima hazir
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                {/* API Key */}
                <div className="space-y-2">
                  <label className="text-sm font-medium flex items-center gap-2">
                    <Key className="h-4 w-4" />
                    API Anahtari
                  </label>
                  <div className="flex gap-2">
                    <Input value={apiResult.apiKey} readOnly className="font-mono" />
                    <Button
                      variant="outline"
                      size="icon"
                      onClick={() => copyToClipboard(apiResult.apiKey)}
                    >
                      <Copy className="h-4 w-4" />
                    </Button>
                  </div>
                  <p className="text-xs text-muted-foreground">
                    Bu anahtari guvenli bir yerde saklayin. Tekrar gosterilmeyecektir.
                  </p>
                </div>

                {/* Endpoint */}
                <div className="space-y-2">
                  <label className="text-sm font-medium flex items-center gap-2">
                    <Code className="h-4 w-4" />
                    Endpoint
                  </label>
                  <div className="flex gap-2">
                    <Input value={apiResult.endpoint} readOnly className="font-mono" />
                    <Button
                      variant="outline"
                      size="icon"
                      onClick={() => copyToClipboard(apiResult.endpoint)}
                    >
                      <Copy className="h-4 w-4" />
                    </Button>
                  </div>
                </div>

                {/* Example Usage */}
                <div className="space-y-2">
                  <label className="text-sm font-medium">Ornek Kullanim</label>
                  <pre className="rounded-lg bg-muted p-4 text-sm overflow-x-auto">
{`curl -X POST ${apiResult.endpoint} \\
  -H "Authorization: Bearer ${apiResult.apiKey}" \\
  -H "Content-Type: application/json" \\
  -d '${JSON.stringify(editableSetup?.exampleInput || { text: "Ornek metin" })}'`}
                  </pre>
                </div>

                <div className="flex gap-4">
                  <Button
                    variant="outline"
                    onClick={() => router.push('/dashboard/apis')}
                  >
                    API'lerime Git
                  </Button>
                  <Button
                    variant="gradient"
                    className="flex-1"
                    onClick={() => router.push(`/dashboard/apis/${apiResult.id}/test`)}
                  >
                    API'yi Test Et
                    <ArrowRight className="ml-2 h-4 w-4" />
                  </Button>
                </div>
              </CardContent>
            </Card>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
