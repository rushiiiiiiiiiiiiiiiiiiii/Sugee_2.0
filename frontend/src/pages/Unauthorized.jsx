import React from 'react';
import { Link } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { ShieldX, Home } from 'lucide-react';

const Unauthorized = () => {
  return (
    <div className="min-h-screen flex items-center justify-center bg-background p-4">
      <div className="text-center space-y-6">
        <div className="mx-auto w-20 h-20 bg-destructive/10 rounded-full flex items-center justify-center">
          <ShieldX className="h-10 w-10 text-destructive" />
        </div>
        
        <div className="space-y-2">
          <h1 className="text-4xl font-bold text-foreground">Access Denied</h1>
          <p className="text-xl text-muted-foreground">
            You don't have permission to access this page
          </p>
          <p className="text-sm text-muted-foreground">
            Please contact your administrator if you believe this is an error.
          </p>
        </div>
        
        <Link to="/dashboard">
          <Button className="bg-primary hover:bg-primary-hover">
            <Home className="h-4 w-4 mr-2" />
            Back to Dashboard
          </Button>
        </Link>
      </div>
    </div>
  );
};

export default Unauthorized;