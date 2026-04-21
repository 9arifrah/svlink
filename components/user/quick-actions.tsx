'use client'

import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Plus, Link2, QrCode } from 'lucide-react'
import { QuickCreateDialog } from '@/components/user/quick-create-dialog'
import { QuickCreateResultModal } from '@/components/user/quick-create-result-modal'
import type { Link } from '@/lib/supabase'

export function QuickActions() {
  const [dialogOpen, setDialogOpen] = useState(false)
  const [resultModalOpen, setResultModalOpen] = useState(false)
  const [createdLink, setCreatedLink] = useState<Link | null>(null)

  const handleOpenDialog = () => {
    setDialogOpen(true)
  }

  const handleSuccess = (link: Link) => {
    setCreatedLink(link)
    setDialogOpen(false)
    setResultModalOpen(true)
  }

  return (
    <>
      <Card>
        <CardHeader>
          <CardTitle>Aksi Cepat</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex flex-wrap gap-2 sm:gap-3">
            <Button
              variant="outline"
              onClick={handleOpenDialog}
              className="w-full sm:w-[200px] text-sm"
            >
              <Plus className="mr-2 h-4 w-4" />
              Quick Create
            </Button>
          </div>
          <p className="text-xs sm:text-sm text-muted-foreground mt-2 sm:mt-3 flex flex-wrap items-center gap-1.5 sm:gap-2">
            <Link2 className="h-3.5 w-3.5" />
            Short link
            <span className="text-slate-300">|</span>
            <QrCode className="h-3.5 w-3.5" />
            QR code
          </p>
        </CardContent>
      </Card>

      <QuickCreateDialog 
        open={dialogOpen} 
        onOpenChange={setDialogOpen} 
        onSuccess={handleSuccess}
      />

      <QuickCreateResultModal
        open={resultModalOpen}
        onOpenChange={setResultModalOpen}
        link={createdLink}
      />
    </>
  )
}