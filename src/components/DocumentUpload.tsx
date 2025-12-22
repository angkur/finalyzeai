import { useState, useRef, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { Badge } from "@/components/ui/badge";
import { Upload, FileText, Trash2, CheckCircle, XCircle, Loader2, Database, LogIn, FileSpreadsheet, FileJson, FileType } from "lucide-react";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import { useNavigate } from "react-router-dom";

interface Document {
  id: string;
  name: string;
  file_path: string;
  file_type: string;
  file_size: number;
  status: string;
  error_message: string | null;
  created_at: string;
  updated_at: string;
}

// Get file type icon
const getFileIcon = (fileType: string) => {
  switch (fileType.toLowerCase()) {
    case '.csv':
      return <FileSpreadsheet className="w-4 h-4 text-green-500 flex-shrink-0" />;
    case '.json':
      return <FileJson className="w-4 h-4 text-yellow-500 flex-shrink-0" />;
    case '.pdf':
      return <FileType className="w-4 h-4 text-red-500 flex-shrink-0" />;
    case '.md':
      return <FileText className="w-4 h-4 text-blue-500 flex-shrink-0" />;
    default:
      return <FileText className="w-4 h-4 text-muted-foreground flex-shrink-0" />;
  }
};

// Get file type badge
const getFileTypeBadge = (fileType: string) => {
  const type = fileType.replace('.', '').toUpperCase();
  const variants: Record<string, string> = {
    'CSV': 'bg-green-500/10 text-green-600 border-green-500/20',
    'JSON': 'bg-yellow-500/10 text-yellow-600 border-yellow-500/20',
    'PDF': 'bg-red-500/10 text-red-600 border-red-500/20',
    'MD': 'bg-blue-500/10 text-blue-600 border-blue-500/20',
    'TXT': 'bg-gray-500/10 text-gray-600 border-gray-500/20',
  };
  return (
    <Badge variant="outline" className={`text-[10px] px-1.5 py-0 ${variants[type] || variants['TXT']}`}>
      {type}
    </Badge>
  );
};

const DocumentUpload = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [documents, setDocuments] = useState<Document[]>([]);
  const [isUploading, setIsUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Fetch documents on mount
  useEffect(() => {
    if (user) {
      fetchDocuments();
    }
  }, [user]);

  const fetchDocuments = async () => {
    if (!user) return;
    
    const { data, error } = await supabase
      .from('documents')
      .select('*')
      .eq('user_id', user.id)
      .order('created_at', { ascending: false });
    
    if (error) {
      console.error('Error fetching documents:', error);
      return;
    }
    
    setDocuments(data || []);
  };

  const handleFileSelect = async (e: React.ChangeEvent<HTMLInputElement>) => {
    if (!user) {
      toast.error("Please sign in to upload documents");
      return;
    }

    const files = e.target.files;
    if (!files || files.length === 0) return;

    const file = files[0];
    const maxSize = 10 * 1024 * 1024; // 10MB
    
    if (file.size > maxSize) {
      toast.error("File too large. Maximum size is 10MB.");
      return;
    }

    const allowedTypes = ['.pdf', '.txt', '.csv', '.json', '.md'];
    const extension = '.' + file.name.split('.').pop()?.toLowerCase();
    
    if (!allowedTypes.includes(extension)) {
      toast.error("Unsupported file type. Please upload PDF, TXT, CSV, JSON, or MD files.");
      return;
    }

    setIsUploading(true);
    setUploadProgress(10);

    try {
      // Read file content
      const content = await file.text();
      setUploadProgress(30);

      // Upload to storage with user folder
      const filePath = `${user.id}/${Date.now()}-${file.name}`;
      const { error: storageError } = await supabase.storage
        .from('documents')
        .upload(filePath, file);

      if (storageError) {
        throw new Error(`Storage upload failed: ${storageError.message}`);
      }
      setUploadProgress(50);

      // Create document record with user_id
      const { data: docData, error: docError } = await supabase
        .from('documents')
        .insert({
          name: file.name,
          file_path: filePath,
          file_type: extension,
          file_size: file.size,
          status: 'pending',
          user_id: user.id,
        })
        .select()
        .single();

      if (docError) {
        throw new Error(`Document record creation failed: ${docError.message}`);
      }
      setUploadProgress(70);

      // Trigger processing with user_id
      const { error: processError } = await supabase.functions.invoke('process-document', {
        body: {
          documentId: docData.id,
          content: content,
          fileName: file.name,
          userId: user.id,
        },
      });

      if (processError) {
        console.error('Processing error:', processError);
        // Update document status to failed
        await supabase
          .from('documents')
          .update({ status: 'failed', error_message: processError.message })
          .eq('id', docData.id);
      }

      setUploadProgress(100);
      toast.success(`Document "${file.name}" uploaded and processing started!`);
      
      // Refresh documents list
      await fetchDocuments();

      // Start polling for status updates
      pollDocumentStatus(docData.id);

    } catch (error) {
      console.error('Upload error:', error);
      toast.error(error instanceof Error ? error.message : "Upload failed");
    } finally {
      setIsUploading(false);
      setUploadProgress(0);
      if (fileInputRef.current) {
        fileInputRef.current.value = '';
      }
    }
  };

  const pollDocumentStatus = async (documentId: string) => {
    const maxAttempts = 60; // 5 minutes max
    let attempts = 0;

    const poll = async () => {
      const { data } = await supabase
        .from('documents')
        .select('status')
        .eq('id', documentId)
        .single();

      if (data?.status === 'completed') {
        toast.success("Document processing completed!");
        fetchDocuments();
        return;
      }

      if (data?.status === 'failed') {
        toast.error("Document processing failed");
        fetchDocuments();
        return;
      }

      attempts++;
      if (attempts < maxAttempts && data?.status === 'processing') {
        setTimeout(poll, 5000); // Poll every 5 seconds
      }
    };

    setTimeout(poll, 3000); // Start polling after 3 seconds
  };

  const handleDelete = async (doc: Document) => {
    try {
      // Delete from storage
      await supabase.storage.from('documents').remove([doc.file_path]);
      
      // Delete from database (chunks will cascade delete)
      const { error } = await supabase
        .from('documents')
        .delete()
        .eq('id', doc.id);

      if (error) throw error;

      toast.success(`Document "${doc.name}" deleted`);
      fetchDocuments();
    } catch (error) {
      console.error('Delete error:', error);
      toast.error("Failed to delete document");
    }
  };

  const formatFileSize = (bytes: number) => {
    if (bytes < 1024) return `${bytes} B`;
    if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
    return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
  };

  const getStatusIcon = (status: Document['status']) => {
    switch (status) {
      case 'completed':
        return <CheckCircle className="w-4 h-4 text-green-500" />;
      case 'failed':
        return <XCircle className="w-4 h-4 text-destructive" />;
      case 'processing':
        return <Loader2 className="w-4 h-4 text-primary animate-spin" />;
      default:
        return <Loader2 className="w-4 h-4 text-muted-foreground" />;
    }
  };

  // Show login prompt if not authenticated
  if (!user) {
    return (
      <div className="space-y-6">
        <div className="flex items-center gap-3">
          <div className="p-2 rounded-lg bg-primary/10">
            <Database className="w-5 h-5 text-primary" />
          </div>
          <div>
            <h3 className="font-display font-semibold text-foreground">Knowledge Base</h3>
            <p className="text-sm text-muted-foreground">Upload documents to enhance RAG queries</p>
          </div>
        </div>
        
        <div className="flex flex-col items-center justify-center p-8 border-2 border-dashed rounded-xl border-border/50">
          <LogIn className="w-10 h-10 text-muted-foreground mb-3" />
          <span className="text-sm font-medium text-foreground mb-1">Sign in required</span>
          <span className="text-xs text-muted-foreground mb-4">Please sign in to upload and manage your documents</span>
          <Button variant="hero" size="sm" onClick={() => navigate('/auth')}>
            Sign In
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center gap-3">
        <div className="p-2 rounded-lg bg-primary/10">
          <Database className="w-5 h-5 text-primary" />
        </div>
        <div>
          <h3 className="font-display font-semibold text-foreground">Knowledge Base</h3>
          <p className="text-sm text-muted-foreground">Upload documents to enhance RAG queries</p>
        </div>
      </div>

      {/* Upload Area */}
      <div className="relative">
        <input
          ref={fileInputRef}
          type="file"
          accept=".pdf,.txt,.csv,.json,.md"
          onChange={handleFileSelect}
          className="hidden"
          id="doc-upload"
          disabled={isUploading}
        />
        <label
          htmlFor="doc-upload"
          className={`flex flex-col items-center justify-center p-8 border-2 border-dashed rounded-xl cursor-pointer transition-all ${
            isUploading 
              ? 'border-primary bg-primary/5' 
              : 'border-border/50 hover:border-primary/50 hover:bg-secondary/30'
          }`}
        >
          {isUploading ? (
            <div className="w-full max-w-xs space-y-3">
              <div className="flex items-center justify-center gap-2">
                <Loader2 className="w-5 h-5 text-primary animate-spin" />
                <span className="text-sm text-foreground">Uploading...</span>
              </div>
              <Progress value={uploadProgress} className="h-2" />
            </div>
          ) : (
            <>
              <Upload className="w-10 h-10 text-muted-foreground mb-3" />
              <span className="text-sm font-medium text-foreground">Drop files here or click to upload</span>
              <span className="text-xs text-muted-foreground mt-1">PDF, TXT, CSV, JSON, MD (max 10MB)</span>
            </>
          )}
        </label>
      </div>

      {/* Documents List */}
      {documents.length > 0 && (
        <div className="space-y-2">
          <h4 className="text-sm font-medium text-muted-foreground">Your Documents ({documents.length})</h4>
          <div className="space-y-2 max-h-[300px] overflow-y-auto">
            {documents.map((doc) => (
              <div 
                key={doc.id}
                className="flex items-center justify-between p-3 rounded-lg bg-secondary/30 border border-border/30"
              >
              <div className="flex items-center gap-3 min-w-0">
                  {getFileIcon(doc.file_type)}
                  <div className="min-w-0">
                    <div className="flex items-center gap-2">
                      <p className="text-sm font-medium text-foreground truncate">{doc.name}</p>
                      {getFileTypeBadge(doc.file_type)}
                    </div>
                    <p className="text-xs text-muted-foreground">
                      {formatFileSize(doc.file_size)} • {doc.status}
                      {doc.error_message && ` • ${doc.error_message}`}
                    </p>
                  </div>
                </div>
                <div className="flex items-center gap-2 flex-shrink-0">
                  {getStatusIcon(doc.status)}
                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={() => handleDelete(doc)}
                    className="h-8 w-8 text-muted-foreground hover:text-destructive"
                  >
                    <Trash2 className="w-4 h-4" />
                  </Button>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {documents.length === 0 && !isUploading && (
        <div className="text-center py-6 text-muted-foreground text-sm">
          No documents uploaded yet. Upload documents to build your knowledge base.
        </div>
      )}
    </div>
  );
};

export default DocumentUpload;
