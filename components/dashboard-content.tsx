"use client"

import { useMemo } from "react"
import Link from "next/link"
import Image from "next/image"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Input } from "@/components/ui/input"
import { Plus, ChevronRight, Zap, Search } from "lucide-react"
import { useSearchTerm } from "@/app/dashboard/layout"
import { cn } from "@/lib/utils"

interface Vehicle {
  id: string
  year: number
  make: string
  model: string
  color: string
  mileage: number
  listed_price: number
  floor_price: number
  status: string
  vin: string
  condition_notes: string
  created_at: string
  image_urls?: string[] | null
}

interface DashboardContentProps {
  vehicles: Vehicle[]
  searchTerm?: string
}

export function DashboardContent({ vehicles, searchTerm: propSearchTerm }: DashboardContentProps) {
  const { searchTerm: contextSearchTerm, setSearchTerm } = useSearchTerm()
  const searchTerm = propSearchTerm || contextSearchTerm || ""

  const filteredVehicles = useMemo(() => {
    if (!searchTerm) return vehicles
    
    const searchLower = searchTerm.toLowerCase()
    return vehicles.filter((v) => {
      return (
        `${v.year} ${v.make} ${v.model}`.toLowerCase().includes(searchLower) ||
        v.vin.toLowerCase().includes(searchLower) ||
        v.color.toLowerCase().includes(searchLower)
      )
    })
  }, [searchTerm, vehicles])

  return (
    <div className="max-w-7xl mx-auto px-4 lg:px-6 py-8">
      <div className="space-y-8">
        {/* Search and Add Vehicle Section */}
        <div className="flex flex-col sm:flex-row gap-4 items-start sm:items-center justify-between">
          <div className="space-y-4 flex-1 w-full sm:w-auto">
            <h1 className="text-4xl font-bold text-foreground">Vehicle Inventory</h1>
            <p className="text-lg text-muted-foreground">Browse and manage available vehicles in your dealership</p>
          </div>
          
          <div className="flex flex-col sm:flex-row gap-4 w-full sm:w-auto sm:min-w-[400px]">
            {/* Search Bar */}
            <div className="flex-1 relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground pointer-events-none" />
              <Input
                type="text"
                placeholder="Search inventory by VIN, model, or stock #..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className={cn(
                  "pl-10 h-10 rounded-lg border-border bg-background",
                  "focus-visible:ring-2 focus-visible:ring-ring focus-visible:border-ring",
                  "transition-all duration-200",
                  "placeholder:text-muted-foreground"
                )}
              />
            </div>

            {/* Add Vehicle Button */}
            <Link href="/dashboard/add">
              <Button
                className={cn(
                  "h-10 px-4 gap-2 bg-blue-600 hover:bg-blue-700 text-white",
                  "rounded-lg shadow-sm hover:shadow-md",
                  "transition-all duration-200",
                  "font-medium w-full sm:w-auto"
                )}
              >
                <Plus className="w-4 h-4" />
                <span className="hidden sm:inline">Add Vehicle</span>
                <span className="sm:hidden">Add</span>
              </Button>
            </Link>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <Card className="bg-card border-border hover:bg-accent/50 transition-colors">
            <CardContent className="pt-6">
              <div className="space-y-2">
                <p className="text-sm text-muted-foreground">Total Vehicles</p>
                <p className="text-3xl font-bold text-foreground">{filteredVehicles.length}</p>
              </div>
            </CardContent>
          </Card>
          <Card className="bg-card border-border hover:bg-accent/50 transition-colors">
            <CardContent className="pt-6">
              <div className="space-y-2">
                <p className="text-sm text-muted-foreground">Total Inventory Value</p>
                <p className="text-3xl font-bold text-primary">
                  ${filteredVehicles.reduce((sum, v) => sum + (v.listed_price || 0), 0).toLocaleString()}
                </p>
              </div>
            </CardContent>
          </Card>
          <Card className="bg-card border-border hover:bg-accent/50 transition-colors">
            <CardContent className="pt-6">
              <div className="space-y-2">
                <p className="text-sm text-muted-foreground">Available</p>
                <p className="text-3xl font-bold text-accent">
                  {filteredVehicles.filter((v) => v.status === "Available").length}
                </p>
              </div>
            </CardContent>
          </Card>
        </div>

        <div className="mt-12">
          {filteredVehicles.length === 0 ? (
            <Card className="bg-card border-border">
              <CardContent className="py-16 text-center">
                <p className="text-muted-foreground text-lg mb-6">
                  {searchTerm ? "No vehicles found matching your search" : "No vehicles found. Add one to get started."}
                </p>
                <Link href="/dashboard/add">
                  <Button className="gap-2">
                    <Plus className="w-4 h-4" />
                    Add Your First Vehicle
                  </Button>
                </Link>
              </CardContent>
            </Card>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {filteredVehicles.map((vehicle) => (
                <Link key={vehicle.id} href={`/inventory/${vehicle.id}`}>
                  <Card className="overflow-hidden hover:border-primary transition-all duration-200 cursor-pointer h-full bg-card border-border hover:bg-accent/50 hover:shadow-lg">
                    {vehicle.image_urls && vehicle.image_urls.length > 0 ? (
                      <div className="h-48 w-full relative overflow-hidden">
                        <Image
                          src={vehicle.image_urls[0]}
                          alt={`${vehicle.year} ${vehicle.make} ${vehicle.model}`}
                          fill
                          className="object-cover"
                          sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
                        />
                      </div>
                    ) : (
                      <div className="h-48 bg-gradient-to-br from-primary/20 to-accent/20 flex items-center justify-center">
                        <Zap className="w-12 h-12 text-muted-foreground/30" />
                      </div>
                    )}

                    <CardContent className="pt-6 space-y-4">
                      <div className="flex items-start justify-between gap-2">
                        <div className="space-y-1 flex-1">
                          <h3 className="text-xl font-bold text-foreground">
                            {vehicle.year} {vehicle.make}
                          </h3>
                          <p className="text-sm text-muted-foreground">{vehicle.model}</p>
                        </div>
                        <Badge variant={vehicle.status === "Available" ? "default" : "secondary"}>
                          {vehicle.status}
                        </Badge>
                      </div>

                      <div className="grid grid-cols-2 gap-3 text-sm">
                        <div className="space-y-1">
                          <p className="text-muted-foreground">Mileage</p>
                          <p className="font-semibold text-foreground">{vehicle.mileage.toLocaleString()} km</p>
                        </div>
                        <div className="space-y-1">
                          <p className="text-muted-foreground">Color</p>
                          <p className="font-semibold text-foreground">{vehicle.color}</p>
                        </div>
                      </div>

                      <div className="pt-2 border-t border-border space-y-2">
                        <div className="flex items-center justify-between">
                          <span className="text-muted-foreground">Listed Price</span>
                          <p className="text-2xl font-bold text-primary">${vehicle.listed_price.toLocaleString()}</p>
                        </div>
                      </div>

                      <div className="w-full mt-2 inline-flex items-center justify-center gap-2 whitespace-nowrap rounded-md text-sm font-medium transition-colors border border-input bg-background shadow-sm pointer-events-none">
                        View Details
                        <ChevronRight className="w-4 h-4" />
                      </div>
                    </CardContent>
                  </Card>
                </Link>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  )
}