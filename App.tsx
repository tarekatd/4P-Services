
import React from 'react';
import { User, Report, UserRole } from './types';
import AdminDashboard from './components/AdminDashboard';
import BankDashboard from './components/BankDashboard';
import ReportDetailsScreen from './components/ReportDetailsScreen';
import Header from './components/Header';
import AuthScreen from './components/AuthScreen';
import ReportFormModal from './components/ReportFormModal';
import AnalyticsView from './components/AnalyticsView';
import { db } from './services/database';

const App: React.FC = () => {
  const [user, setUser] = React.useState<User | null>(null);
  // Initialize states with empty arrays, they will be populated by db subscription
  const [users, setUsers] = React.useState<User[]>([]);
  const [reports, setReports] = React.useState<Report[]>([]);
  const [selectedReport, setSelectedReport] = React.useState<Report | null>(null);
  const [authView, setAuthView] = React.useState<'login' | 'register'>('login');
  const [editingReport, setEditingReport] = React.useState<Report | null>(null);
  const [route, setRoute] = React.useState(window.location.hash || '#/');

  // Subscribe to Data
  React.useEffect(() => {
    // Reports subscription
    const unsubscribeReports = db.subscribeToReports((updatedReports) => {
        setReports(updatedReports);
    });

    // Users subscription
    const unsubscribeUsers = db.subscribeToUsers((updatedUsers) => {
        setUsers(updatedUsers);
    });

    return () => {
        unsubscribeReports();
        unsubscribeUsers();
    };
  }, []);

  React.useEffect(() => {
    const handleHashChange = () => {
      setRoute(window.location.hash || '#/');
    };
    window.addEventListener('hashchange', handleHashChange);
    // Set initial route in case the page loads with a hash
    handleHashChange();
    return () => {
      window.removeEventListener('hashchange', handleHashChange);
    };
  }, []);


  const handleLogin = React.useCallback((loggedInUser: User) => {
    setUser(loggedInUser);
  }, []);

  const handleLogout = React.useCallback(() => {
    setUser(null);
    setSelectedReport(null);
    window.location.hash = '#/'; // Reset to dashboard on logout
  }, []);

  const handleViewDetails = React.useCallback((report: Report) => {
    setSelectedReport(report);
  }, []);

  const handleBackToList = React.useCallback(() => {
    setSelectedReport(null);
  }, []);

  const handleAddReport = React.useCallback(async (newReportData: Omit<Report, 'id'> | Report) => {
    // If it has an ID, it might be an update in disguise or a direct add with ID
    if ('id' in newReportData) {
        // Technically this branch is rarely used for new reports in this app logic
        // but let's treat it safely
        await db.addReport(newReportData);
    } else {
        await db.addReport(newReportData);
    }
  }, []);

  const handleBulkAddReports = React.useCallback(async (newReports: Omit<Report, 'id'>[]) => {
      // Process serially or parallel
      for (const report of newReports) {
          await db.addReport(report);
      }
  }, []);

  const handleAddUser = React.useCallback(async (newUser: Omit<User, 'id'>) => {
    await db.addUser(newUser);
  }, []);

  const handleUpdateUser = React.useCallback(async (userToUpdate: User) => {
    await db.updateUser(userToUpdate);
  }, []);

  const handleDeleteUser = React.useCallback(async (userId: string) => {
    await db.deleteUser(userId);
  }, []);

  const handleRegister = React.useCallback(async (newUserRegistrationData: Omit<User, 'id'>): Promise<boolean> => {
    // Check if username exists
    const usernameExists = users.some(u => u.username === newUserRegistrationData.username);
    if (usernameExists) {
        return false;
    }
    await db.addUser(newUserRegistrationData);
    setAuthView('login');
    return true;
  }, [users]);
  
  const handleRequestEdit = React.useCallback((report: Report) => {
    setSelectedReport(null);
    setEditingReport(report);
  }, []);

  const handleUpdateReport = React.useCallback(async (reportToUpdate: Omit<Report, 'id'> | Report) => {
    if (!('id' in reportToUpdate)) {
        console.error("Attempted to update a report without an ID.");
        return;
    }
    await db.updateReport(reportToUpdate as Report);
    setEditingReport(null);
    setSelectedReport(reportToUpdate as Report);
  }, []);

  const handleCancelEdit = React.useCallback(() => {
    if (editingReport) {
        setSelectedReport(editingReport);
    }
    setEditingReport(null);
  }, [editingReport]);

  const handleDeleteReports = React.useCallback(async (reportIdsToDelete: string[]) => {
    await db.deleteReports(reportIdsToDelete);
  }, []);

  const handleDeleteReportFromDetails = React.useCallback(async () => {
    if (selectedReport) {
        await db.deleteReports([selectedReport.id]);
        setSelectedReport(null);
    }
  }, [selectedReport, handleDeleteReports]);

  const renderDashboard = () => {
    if (route === '#/analytics') {
      return (
        <div className="container mx-auto">
          <h1 className="text-3xl font-bold text-slate-800 mb-6">التحليلات</h1>
          <AnalyticsView reports={reports} />
        </div>
      );
    }

    if (user?.role === UserRole.ADMIN) {
      return <AdminDashboard 
        reports={reports} 
        onAddReport={handleAddReport} 
        onViewDetails={handleViewDetails} 
        users={users}
        onAddUser={handleAddUser}
        onUpdateUser={handleUpdateUser}
        onDeleteUser={handleDeleteUser}
        onBulkAddReports={handleBulkAddReports}
        onDeleteReports={handleDeleteReports}
      />;
    }
    if (user?.role === UserRole.BANK) {
      return <BankDashboard reports={reports} onViewDetails={handleViewDetails} />;
    }
    return null;
  };

  const renderContent = () => {
    if (!user) {
       return <AuthScreen
          authView={authView}
          onLogin={handleLogin}
          users={users}
          onRegister={handleRegister}
          onSwitchToLogin={() => setAuthView('login')}
          onSwitchToRegister={() => setAuthView('register')}
        />;
    }

    if (selectedReport) {
      return <ReportDetailsScreen 
        report={selectedReport} 
        onBack={handleBackToList} 
        user={user}
        onEdit={handleRequestEdit}
        onDelete={handleDeleteReportFromDetails}
      />;
    }

    return renderDashboard();
  };

  return (
    <div className="bg-slate-50 min-h-screen text-slate-700">
      {user && <Header user={user} onLogout={handleLogout} route={route} />}
      <main className={user ? "p-4 sm:p-6 md:p-8" : ""}>
        {renderContent()}
      </main>
      {editingReport && (
        <ReportFormModal
            isOpen={!!editingReport}
            onClose={handleCancelEdit}
            onSubmit={handleUpdateReport}
            initialData={editingReport}
        />
      )}
    </div>
  );
};

export default App;
