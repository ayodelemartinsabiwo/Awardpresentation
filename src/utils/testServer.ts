import { projectId, publicAnonKey } from './supabase/info';

export async function testServerConnection() {
  try {
    console.log('Testing server connection...');
    console.log('Project ID:', projectId);
    console.log('URL:', `https://${projectId}.supabase.co/functions/v1/make-server-b6556629/health`);
    
    const response = await fetch(
      `https://${projectId}.supabase.co/functions/v1/make-server-b6556629/health`,
      {
        headers: {
          'Authorization': `Bearer ${publicAnonKey}`
        }
      }
    );
    
    console.log('Response status:', response.status);
    console.log('Response ok:', response.ok);
    
    if (response.ok) {
      const data = await response.json();
      console.log('Server response:', data);
      return { success: true, data };
    } else {
      const text = await response.text();
      console.error('Server error response:', text);
      return { success: false, error: `Server returned ${response.status}: ${text}` };
    }
  } catch (error) {
    console.error('Connection error:', error);
    return { success: false, error: String(error) };
  }
}
