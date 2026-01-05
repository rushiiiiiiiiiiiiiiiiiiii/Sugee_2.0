import React, { useState } from 'react';
import { Navigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import { toast } from '@/hooks/use-toast';
import { Building2 } from 'lucide-react';
  import { ClipLoader } from "react-spinners"; // add this at the top

const Login = () => {
  const [credentials, setCredentials] = useState({ username: '', password: '' });
  const [isLoading, setIsLoading] = useState(false);
  const { login, user } = useAuth();

  if (user) {
    return <Navigate to="/dashboard" replace />;
  }

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsLoading(true);

    const result = await login(credentials.username, credentials.password);
    
    if (result.success) {
      toast({
        title: "Login Successful",
        description: "Welcome to Sugee Group Store Inventory Management",
      });
    } else {
      toast({
        title: "Login Failed",
        description: result.message,
        variant: "destructive",
      });
    }
    
    setIsLoading(false);
  };

  const handleChange = (e) => {
    setCredentials({
      ...credentials,
      [e.target.name]: e.target.value
    });
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-primary/10 to-accent/10 p-4">
      <Card className="w-full max-w-md shadow-lg">
        <CardHeader className="text-center space-y-4">
          <div className="mx-auto w-16 h-16 bg-primary rounded-full flex items-center justify-center">
            <Building2 className="h-8 w-8 text-primary-foreground" />
          </div>
          <div>
            <CardTitle className="text-2xl font-bold">Sugee Group</CardTitle>
            <CardDescription>Inventory Management System</CardDescription>
          </div>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="username">Username</Label>
              <Input
                id="username"
                name="username"
                type="text"
                placeholder="Enter username"
                value={credentials.username}
                onChange={handleChange}
                required
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="password">Password</Label>
              <Input
                id="password"
                name="password"
                type="password"
                placeholder="Enter password"
                value={credentials.password}
                onChange={handleChange}
                required
              />
            </div>

<Button
  type="submit"
  disabled={isLoading}
  className={`w-full h-12 flex cursor-pointer items-center justify-center rounded-xl font-semibold shadow-md transition-all 
    ${isLoading 
      ? "bg-blue-400 cursor-not-allowed" 
      : "bg-blue-600 hover:bg-blue-700 active:scale-95 text-white"}`}
>
  {isLoading ? (
    <ClipLoader size={20} color="#fff" />
  ) : (
    "Sign In"
  )}
</Button>

          </form>
          
          
        </CardContent>
      </Card>
    </div>
  );
};

export default Login;