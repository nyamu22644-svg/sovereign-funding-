import React, { createContext, useContext, useEffect, useState } from 'react';

interface ContentData {
  [key: string]: string;
}

interface ContentContextType {
  content: ContentData;
  loading: boolean;
  t: (key: string) => string;
  updateContent: (key: string, value: string) => Promise<boolean>;
}

const ContentContext = createContext<ContentContextType | undefined>(undefined);

export const ContentProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [content, setContent] = useState<ContentData>({});
  const [loading, setLoading] = useState(true);

  const fetchContent = async () => {
    try {
      const response = await fetch('http://localhost:3005/api/content');
      const data = await response.json();
      setContent(data);
    } catch (error) {
      console.error('Failed to fetch content:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchContent();
  }, []);

  const t = (key: string) => {
    return content[key] || `[${key}]`;
  };

  const updateContent = async (key: string, value: string) => {
    try {
      const response = await fetch('http://localhost:3005/api/content/update', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ key, value }),
      });
      if (response.ok) {
        setContent(prev => ({ ...prev, [key]: value }));
        return true;
      }
    } catch (error) {
      console.error('Update failed:', error);
    }
    return false;
  };

  return (
    <ContentContext.Provider value={{ content, loading, t, updateContent }}>
      {children}
    </ContentContext.Provider>
  );
};

export const useContent = () => {
  const context = useContext(ContentContext);
  if (!context) {
    throw new Error('useContent must be used within a ContentProvider');
  }
  return context;
};
