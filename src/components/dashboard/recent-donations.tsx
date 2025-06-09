"use client"

import {
  Avatar,
  AvatarFallback,
  AvatarImage,
} from "@/components/ui/avatar"

export function RecentDonations() {
  return (
    <div className="space-y-8">
      {recentDonations.map((donation) => (
        <div className="flex items-center" key={donation.id}>
          <Avatar className="h-9 w-9">
            <AvatarImage src={donation.avatar} alt="Avatar" />
            <AvatarFallback>{donation.initials}</AvatarFallback>
          </Avatar>
          <div className="ml-4 space-y-1">
            <p className="text-sm font-medium leading-none">{donation.name}</p>
            <p className="text-sm text-muted-foreground">
              {donation.email}
            </p>
          </div>
          <div className="ml-auto font-medium">${donation.amount}</div>
        </div>
      ))}
    </div>
  )
}

const recentDonations = [
  {
    id: "1",
    name: "Olivia Martin",
    email: "olivia.martin@example.com",
    amount: 199.99,
    avatar: "/avatars/01.png",
    initials: "OM"
  },
  {
    id: "2",
    name: "Jackson Lee",
    email: "jackson.lee@example.com",
    amount: 39.99,
    avatar: "/avatars/02.png",
    initials: "JL"
  },
  {
    id: "3",
    name: "Isabella Nguyen",
    email: "isabella.nguyen@example.com",
    amount: 299.99,
    avatar: "/avatars/03.png",
    initials: "IN"
  },
  {
    id: "4",
    name: "William Kim",
    email: "will@email.com",
    amount: 99.99,
    avatar: "/avatars/04.png",
    initials: "WK"
  },
  {
    id: "5",
    name: "Sofia Davis",
    email: "sofia.davis@example.com",
    amount: 149.99,
    avatar: "/avatars/05.png",
    initials: "SD"
  }
]
