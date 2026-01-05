import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Search, MapPin, Activity, TrendingUp } from 'lucide-react';

const SiteActivities = () => {
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedSite, setSelectedSite] = useState('all');

  const mockSiteActivities = [
    {
      id: 1,
      site: 'Site A - Main Building',
      manager: 'Mike Johnson',
      activity: 'Material Request',
      description: 'Requested 50 Steel Rods and 20 Cement Bags',
      timestamp: '2024-01-15 10:30 AM',
      status: 'Completed',
      priority: 'Medium'
    },
    {
      id: 2,
      site: 'Site B - Residential Complex',
      manager: 'Sarah Brown',
      activity: 'Delivery Received',
      description: 'Received 1000 Bricks - All items in good condition',
      timestamp: '2024-01-15 09:15 AM',
      status: 'Completed',
      priority: 'Low'
    },
    {
      id: 3,
      site: 'Site C - Commercial Plaza',
      manager: 'Alex Wilson',
      activity: 'Issue Reported',
      description: '2 Cement bags damaged during delivery',
      timestamp: '2024-01-15 08:45 AM',
      status: 'Under Review',
      priority: 'High'
    },
    {
      id: 4,
      site: 'Site D - Infrastructure',
      manager: 'Emma Davis',
      activity: 'Material Request',
      description: 'Urgent request for 25 PVC Pipes',
      timestamp: '2024-01-14 04:20 PM',
      status: 'Pending',
      priority: 'Critical'
    },
    {
      id: 5,
      site: 'Site E - Housing Project',
      manager: 'Tom Miller',
      activity: 'Delivery Scheduled',
      description: '100 meters Electrical Cables scheduled for delivery',
      timestamp: '2024-01-14 02:10 PM',
      status: 'In Progress',
      priority: 'Medium'
    },
    {
      id: 6,
      site: 'Site A - Main Building',
      manager: 'Mike Johnson',
      activity: 'Inventory Update',
      description: 'Updated current stock levels and usage reports',
      timestamp: '2024-01-14 11:30 AM',
      status: 'Completed',
      priority: 'Low'
    }
  ];

  const sites = ['All Sites', 'Site A - Main Building', 'Site B - Residential Complex', 'Site C - Commercial Plaza', 'Site D - Infrastructure', 'Site E - Housing Project'];

  const filteredActivities = mockSiteActivities.filter(activity => {
    const matchesSearch = activity.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         activity.site.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         activity.manager.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         activity.activity.toLowerCase().includes(searchTerm.toLowerCase());
    
    const matchesSite = selectedSite === 'all' || selectedSite === 'All Sites' || activity.site === selectedSite;
    
    return matchesSearch && matchesSite;
  });

  const getStatusColor = (status) => {
    switch (status) {
      case 'Completed': return 'bg-success text-success-foreground';
      case 'In Progress': return 'bg-primary text-primary-foreground';
      case 'Pending': return 'bg-warning text-warning-foreground';
      case 'Under Review': return 'bg-accent text-accent-foreground';
      case 'Cancelled': return 'bg-destructive text-destructive-foreground';
      default: return 'bg-muted text-muted-foreground';
    }
  };

  const getPriorityColor = (priority) => {
    switch (priority) {
      case 'Critical': return 'bg-destructive text-destructive-foreground';
      case 'High': return 'bg-warning text-warning-foreground';
      case 'Medium': return 'bg-primary text-primary-foreground';
      case 'Low': return 'bg-muted text-muted-foreground';
      default: return 'bg-muted text-muted-foreground';
    }
  };

  const getActivityIcon = (activity) => {
    switch (activity) {
      case 'Material Request': return '📦';
      case 'Delivery Received': return '✅';
      case 'Issue Reported': return '⚠️';
      case 'Delivery Scheduled': return '🚚';
      case 'Inventory Update': return '📊';
      default: return '📋';
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center space-x-3">
        <div className="p-2 bg-primary rounded-lg">
          <Activity className="h-6 w-6 text-primary-foreground" />
        </div>
        <h1 className="text-3xl font-bold text-foreground">Site Activities</h1>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center">
              <MapPin className="h-8 w-8 text-primary" />
              <div className="ml-4">
                <p className="text-sm font-medium text-muted-foreground">Active Sites</p>
                <div className="text-2xl font-bold text-foreground">8</div>
              </div>
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center">
              <Activity className="h-8 w-8 text-success" />
              <div className="ml-4">
                <p className="text-sm font-medium text-muted-foreground">Today's Activities</p>
                <div className="text-2xl font-bold text-foreground">23</div>
              </div>
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center">
              <TrendingUp className="h-8 w-8 text-warning" />
              <div className="ml-4">
                <p className="text-sm font-medium text-muted-foreground">Pending Issues</p>
                <div className="text-2xl font-bold text-foreground">5</div>
              </div>
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center">
              <Activity className="h-8 w-8 text-accent" />
              <div className="ml-4">
                <p className="text-sm font-medium text-muted-foreground">Efficiency Rate</p>
                <div className="text-2xl font-bold text-foreground">94%</div>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Filters */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle>Activity Timeline</CardTitle>
            <div className="flex items-center space-x-4">
              <div className="relative">
                <Search className="h-4 w-4 absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground" />
                <Input
                  placeholder="Search activities..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10 w-64"
                />
              </div>
              <Select value={selectedSite} onValueChange={setSelectedSite}>
                <SelectTrigger className="w-48">
                  <SelectValue placeholder="Filter by site" />
                </SelectTrigger>
                <SelectContent>
                  {sites.map((site) => (
                    <SelectItem key={site} value={site === 'All Sites' ? 'all' : site}>
                      {site}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {filteredActivities.map((activity) => (
              <div key={activity.id} className="flex items-start space-x-4 p-4 border border-border rounded-lg hover:bg-muted/30">
                <div className="text-2xl">{getActivityIcon(activity.activity)}</div>
                
                <div className="flex-1 space-y-2">
                  <div className="flex items-center justify-between">
                    <div>
                      <h4 className="font-semibold text-foreground">{activity.activity}</h4>
                      <p className="text-sm text-muted-foreground">{activity.site} - {activity.manager}</p>
                    </div>
                    <div className="flex items-center space-x-2">
                      <Badge className={getPriorityColor(activity.priority)}>
                        {activity.priority}
                      </Badge>
                      <Badge className={getStatusColor(activity.status)}>
                        {activity.status}
                      </Badge>
                    </div>
                  </div>
                  
                  <p className="text-foreground">{activity.description}</p>
                  
                  <p className="text-xs text-muted-foreground">{activity.timestamp}</p>
                </div>
              </div>
            ))}
          </div>
          
          {filteredActivities.length === 0 && (
            <div className="text-center py-8">
              <p className="text-muted-foreground">No activities found matching your criteria.</p>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
};

export default SiteActivities;