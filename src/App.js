const editPackage = (pkg) => {
    setSelectedAttractions(pkg.attractions);
    setEditingPackage(pkg.id);
    setPackages(packages.filter(p => p.id !== pkg.id));
  };import React, { useState } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Loader2, Mail, Trash2 } from 'lucide-react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";

const attractions = [
  { id: 1, name: 'Serengeti National Park', type: 'Park' },
  { id: 2, name: 'Mount Kilimanjaro', type: 'Adventure' },
  { id: 3, name: 'Zanzibar Beach Resort', type: 'Hotel' },
  { id: 4, name: 'Stone Town Tour', type: 'Cultural' },
];

const currencies = [
  { value: 'USD', symbol: '$' },
  { value: 'GBP', symbol: '£' },
  { value: 'EUR', symbol: '€' },
];

const TourPackageBuilder = () => {
  const [packages, setPackages] = useState([]);
  const [selectedAttractions, setSelectedAttractions] = useState([]);
  const [isGenerating, setIsGenerating] = useState(false);
  const [showSendDialog, setShowSendDialog] = useState(false);
  const [customerDetails, setCustomerDetails] = useState({ name: '', email: '' });
  const [currentAttraction, setCurrentAttraction] = useState(null);
  const [attractionDetails, setAttractionDetails] = useState({ days: '', price: '', currency: 'USD' });
  
  const handleDragStart = (e, attraction) => {
    e.dataTransfer.setData('attraction', JSON.stringify(attraction));
  };

  const handleDrop = (e) => {
    e.preventDefault();
    const attraction = JSON.parse(e.dataTransfer.getData('attraction'));
    setCurrentAttraction(attraction);
  };

  const handleDragOver = (e) => {
    e.preventDefault();
  };

  const addAttractionToPackage = () => {
    const enrichedAttraction = {
      ...currentAttraction,
      days: parseInt(attractionDetails.days),
      durationType: attractionDetails.durationType || 'days',
      price: parseFloat(attractionDetails.price),
      currency: attractionDetails.currency
    };
    setSelectedAttractions([...selectedAttractions, enrichedAttraction]);
    setCurrentAttraction(null);
    setAttractionDetails({ days: '', price: '', currency: 'USD' });
  };

  const [editingAttractionIndex, setEditingAttractionIndex] = useState(null);
  const [editingPackage, setEditingPackage] = useState(null);

  const editAttraction = (index) => {
    const attraction = selectedAttractions[index];
    setCurrentAttraction(attraction);
    setAttractionDetails({
      days: attraction.days,
      durationType: attraction.durationType,
      price: attraction.price,
      currency: attraction.currency
    });
    setEditingAttractionIndex(index);
    setSelectedAttractions(selectedAttractions.filter((_, i) => i !== index));
  };

  const generatePackage = () => {
    setIsGenerating(true);
    setTimeout(() => {
      const calculateDuration = (attractions) => {
        let totalHours = 0;
        let totalDays = 0;

        attractions.forEach(attr => {
          if (attr.durationType === 'hours') {
            const hours = parseFloat(attr.days);
            if (hours > 16) {
              totalDays += 1;
            } else {
              totalHours += hours;
            }
          } else {
            totalDays += parseInt(attr.days);
          }
        });

        // Convert remaining hours to days if >= 16
        if (totalHours >= 16) {
          totalDays += 1;
          totalHours = 0;
        }

        // Round up hours to nearest integer
        totalHours = Math.ceil(totalHours);

        if (totalDays > 0 && totalHours > 0) {
          return `${totalDays} days and ${totalHours} hours`;
        } else if (totalDays > 0) {
          return `${totalDays} days`;
        } else {
          return `${totalHours} hours`;
        }
      };

      const formattedDuration = calculateDuration(selectedAttractions);
      const pricesByCurrency = selectedAttractions.reduce((acc, curr) => {
        acc[curr.currency] = (acc[curr.currency] || 0) + curr.price;
        return acc;
      }, {});
      
      const pricesText = Object.entries(pricesByCurrency)
        .map(([currency, amount]) => 
          `${currencies.find(c => c.value === currency).symbol}${amount.toFixed(2)} ${currency}`
        )
        .join(' / ');

      const newPackage = {
        id: Date.now(),
        attractions: [...selectedAttractions],
        totalDays,
        prices: pricesByCurrency,
        description: `
          🌟 Tanzania Adventure Package
          Duration: ${formattedDuration}
          Price: ${pricesText}

          Experience the best of Tanzania with our carefully curated package:
          
          Itinerary:
          ${selectedAttractions.map((attraction, index) => 
            `Day ${index + 1}: ${attraction.name} (${attraction.days} ${attraction.durationType}) - ${currencies.find(c => c.value === attraction.currency).symbol}${attraction.price} ${attraction.currency}`
          ).join('\n')}

          Package includes:
          - Professional guide
          - All entrance fees
          - Transportation between attractions
          - Accommodation
        `
      };
      
      setPackages([...packages, newPackage]);
      setSelectedAttractions([]);
      setIsGenerating(false);
    }, 2000);
  };

  const deletePackage = (packageId) => {
    setPackages(packages.filter(pkg => pkg.id !== packageId));
  };

  const sendPackages = () => {
    alert(`Packages sent to ${customerDetails.email}`);
    setShowSendDialog(false);
    setPackages([]);
    setCustomerDetails({ name: '', email: '' });
  };

  return (
    <div className="p-4 max-w-6xl mx-auto">
      <div className="grid grid-cols-3 gap-4">
        <div>
          <h2 className="text-xl font-bold mb-4">Available Attractions</h2>
          <div className="space-y-2">
            {attractions.map(attraction => (
              <Card 
                key={attraction.id}
                draggable
                onDragStart={(e) => handleDragStart(e, attraction)}
                className="cursor-move hover:shadow-lg transition-shadow"
              >
                <CardContent className="p-4">
                  <h3 className="font-semibold">{attraction.name}</h3>
                  <p className="text-sm text-gray-600">{attraction.type}</p>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>

        <div>
          <div className="flex justify-between items-center mb-4">
            <h2 className="text-xl font-bold">Create Package</h2>
            {editingPackage && (
              <Button 
                size="sm"
                variant="outline"
                onClick={() => {
                  setEditingPackage(null);
                  setSelectedAttractions([]);
                }}
              >
                Cancel Edit
              </Button>
            )}
          </div>
          <div className="space-y-4">
            <div 
              className="min-h-96 border-2 border-dashed rounded-lg p-4"
              onDrop={handleDrop}
              onDragOver={handleDragOver}
            >
              {currentAttraction ? (
                <Card className="mb-4">
                  <CardContent className="p-4 space-y-4">
                    <div className="flex justify-between items-start">
                      <h3 className="font-semibold">{currentAttraction.name}</h3>
                      <Button 
                        size="sm" 
                        variant="outline"
                        onClick={() => setCurrentAttraction(null)}
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                    <div className="space-y-2">
                      <div className="flex gap-2">
                        <Input
                          type="number"
                          placeholder="Duration"
                          value={attractionDetails.days}
                          onChange={(e) => setAttractionDetails({...attractionDetails, days: e.target.value})}
                        />
                        <Select 
                          value={attractionDetails.durationType || 'days'}
                          onValueChange={(value) => setAttractionDetails({...attractionDetails, durationType: value})}
                        >
                          <SelectTrigger className="w-24">
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="days">Days</SelectItem>
                            <SelectItem value="hours">Hours</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>
                      <div className="flex gap-2">
                        <Input
                          type="number"
                          placeholder="Price"
                          value={attractionDetails.price}
                          onChange={(e) => setAttractionDetails({...attractionDetails, price: e.target.value})}
                        />
                        <Select 
                          value={attractionDetails.currency}
                          onValueChange={(value) => setAttractionDetails({...attractionDetails, currency: value})}
                        >
                          <SelectTrigger className="w-24">
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent>
                            {currencies.map(currency => (
                              <SelectItem key={currency.value} value={currency.value}>
                                {currency.value}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      </div>
                    </div>
                    <Button 
                      className="w-full"
                      onClick={addAttractionToPackage}
                      disabled={!attractionDetails.days || !attractionDetails.price}
                    >
                      <Button 
                      className="w-full"
                      onClick={addAttractionToPackage}
                      disabled={!attractionDetails.days || !attractionDetails.price}
                    >
                      {editingAttractionIndex !== null ? 'Save Changes' : 'Add to Package'}
                    </Button>
                    </Button>
                  </CardContent>
                </Card>
              ) : null}
              
              {selectedAttractions.length === 0 && !currentAttraction ? (
                <p className="text-gray-500 text-center mt-8">
                  Drag attractions here to build your package
                </p>
              ) : (
                <div className="space-y-2">
                  {selectedAttractions.map((attraction, index) => (
                    <Card key={index} className="bg-gray-50">
                      <CardContent className="p-4">
                        <div className="flex justify-between items-start">
                          <div>
                            <h3 className="font-semibold">{attraction.name}</h3>
                            <p className="text-sm text-gray-600">
                              {attraction.days} {attraction.durationType} 
                              {currencies.find(c => c.value === attraction.currency).symbol}
                              {attraction.price} {attraction.currency}
                            </p>
                          </div>
                          <div>
                            <Button 
                              size="sm" 
                              variant="outline"
                              onClick={() => editAttraction(index)}
                              className="mr-2"
                            >
                              Edit
                            </Button>
                            <Button 
                              size="sm" 
                              variant="outline"
                              onClick={() => setSelectedAttractions(selectedAttractions.filter((_, i) => i !== index))}
                            >
                              <Trash2 className="h-4 w-4" />
                            </Button>
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              )}
            </div>
            
            <Button 
              className="w-full"
              onClick={generatePackage}
              disabled={selectedAttractions.length === 0 || isGenerating}
            >
              {isGenerating ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Generating Package...
                </>
              ) : (
                'Generate Package'
              )}
            </Button>
          </div>
        </div>

        <div>
          <div className="flex justify-between items-center mb-4">
            <h2 className="text-xl font-bold">Generated Packages</h2>
            {packages.length > 0 && (
              <Dialog open={showSendDialog} onOpenChange={setShowSendDialog}>
                <DialogTrigger asChild>
                  <Button>
                    <Mail className="h-4 w-4 mr-2" />
                    Send Packages
                  </Button>
                </DialogTrigger>
                <DialogContent>
                  <DialogHeader>
                    <DialogTitle>Send Packages</DialogTitle>
                  </DialogHeader>
                  <div className="space-y-4 mt-4">
                    <Input
                      placeholder="Customer Name"
                      value={customerDetails.name}
                      onChange={(e) => setCustomerDetails({...customerDetails, name: e.target.value})}
                    />
                    <Input
                      placeholder="Customer Email"
                      type="email"
                      value={customerDetails.email}
                      onChange={(e) => setCustomerDetails({...customerDetails, email: e.target.value})}
                    />
                    <Button 
                      className="w-full"
                      onClick={sendPackages}
                      disabled={!customerDetails.name || !customerDetails.email}
                    >
                      Send {packages.length} Package{packages.length !== 1 ? 's' : ''}
                    </Button>
                  </div>
                </DialogContent>
              </Dialog>
            )}
          </div>
          <div className="space-y-4">
            {packages.map(pkg => (
              <Card key={pkg.id}>
                <CardContent className="p-4">
                  <div className="flex justify-between items-start mb-2">
                    <h3 className="font-semibold">Package #{packages.indexOf(pkg) + 1}</h3>
                    <div className="flex gap-2">
                      <Button 
                        size="sm" 
                        variant="outline"
                        onClick={() => editPackage(pkg)}
                      >
                        Edit
                      </Button>
                      <Button 
                        size="sm" 
                        variant="outline"
                        onClick={() => deletePackage(pkg.id)}
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                  <div className="text-sm whitespace-pre-line">
                    {pkg.description}
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

export default TourPackageBuilder;
