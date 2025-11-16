// POC: Minimal App to test auth module
import { AuthProvider } from '@modules/auth';

function App() {
  return (
    <AuthProvider>
      <div style={{ padding: '2rem', textAlign: 'center' }}>
        <h1>AdTopia v2 - Auth Module POC</h1>
        <p>✅ Auth module migrated successfully!</p>
        <p>Module structure is working.</p>
      </div>
    </AuthProvider>
  );
}

export default App;

