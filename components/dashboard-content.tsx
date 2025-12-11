"use client"

import { useMemo, useState } from "react"
import Link from "next/link"
import Image from "next/image"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import { Skeleton } from "@/components/ui/skeleton"
import { Search, Plus, ChevronRight, Zap } from "lucide-react"

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
}

export function DashboardContent({ vehicles }: DashboardContentProps) {
  const [searchTerm, setSearchTerm] = useState("")

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
    <main className="min-h-screen bg-background">
      <div className="max-w-7xl mx-auto px-6 py-12">
        {/* Header */}
        <div className="space-y-8">
          <div className="space-y-4">
            <h1 className="text-4xl font-bold text-foreground">Vehicle Inventory</h1>
            <p className="text-lg text-muted-foreground">Browse and manage available vehicles in your dealership</p>
          </div>

          {/* Search Bar */}
          <div className="flex gap-4">
            <div className="flex-1 relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground pointer-events-none" />
              <Input
                placeholder="Search by make, model, year, or VIN..."
                className="pl-10 h-11 bg-card border-border text-foreground focus-visible:ring-2 focus-visible:ring-ring"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>
            <Link href="/dashboard/add">
              <Button className="h-11 gap-2 transition-all hover:scale-105">
                <Plus className="w-4 h-4" />
                Add New
              </Button>
            </Link>
          </div>

          {/* Stats */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <Card className="bg-card/50 border-border hover:bg-card/70 transition-colors">
              <CardContent className="pt-6">
                <div className="space-y-2">
                  <p className="text-sm text-muted-foreground">Total Vehicles</p>
                  <p className="text-3xl font-bold text-foreground">{filteredVehicles.length}</p>
                </div>
              </CardContent>
            </Card>
            <Card className="bg-card/50 border-border hover:bg-card/70 transition-colors">
              <CardContent className="pt-6">
                <div className="space-y-2">
                  <p className="text-sm text-muted-foreground">Total Inventory Value</p>
                  <p className="text-3xl font-bold text-primary">
                    ${filteredVehicles.reduce((sum, v) => sum + (v.listed_price || 0), 0).toLocaleString()}
                  </p>
                </div>
              </CardContent>
            </Card>
            <Card className="bg-card/50 border-border hover:bg-card/70 transition-colors">
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
        </div>

        {/* Vehicle Grid */}
        <div className="mt-12">
          {filteredVehicles.length === 0 ? (
            <Card className="bg-card/50 border-border">
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
                  <Card className="overflow-hidden hover:border-primary transition-all duration-200 cursor-pointer h-full bg-card/50 border-border hover:bg-card hover:shadow-lg">
                    {/* Vehicle Image */}
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
                      {/* Status Badge */}
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

                      {/* Details */}
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

                      {/* Price */}
                      <div className="pt-2 border-t border-border space-y-2">
                        <div className="flex items-center justify-between">
                          <span className="text-muted-foreground">Listed Price</span>
                          <p className="text-2xl font-bold text-primary">${vehicle.listed_price.toLocaleString()}</p>
                        </div>
                      </div>

                      {/* View Details Link */}
                      <Button variant="outline" className="w-full gap-2 mt-2 border-border bg-transparent hover:bg-accent hover:text-accent-foreground transition-colors">
                        View Details
                        <ChevronRight className="w-4 h-4" />
                      </Button>
                    </CardContent>
                  </Card>
                </Link>
              ))}
            </div>
          )}
        </div>
      </div>
    </main>
  )
}
