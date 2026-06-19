import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'

export function TestPage() {
  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-background p-4">
      <div className="w-full max-w-2xl space-y-8">
        {/* Title */}
        <div className="text-center">
          <h1 className="text-4xl font-bold text-foreground-heading mb-2">
            Design System Test
          </h1>
          <p className="text-muted-foreground">
            Tailwind v4 + Design Tokens
          </p>
        </div>

        {/* Colors Palette */}
        <Card>
          <CardHeader>
            <CardTitle>Color Palette</CardTitle>
            <CardDescription>Design tokens in light mode</CardDescription>
          </CardHeader>
          <CardContent className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <div className="h-20 bg-accent rounded-md flex items-center justify-center text-white font-semibold">
                Accent
              </div>
              <p className="text-sm text-muted-foreground">--accent: #aa3bff</p>
            </div>
            <div className="space-y-2">
              <div className="h-20 bg-destructive rounded-md flex items-center justify-center text-white font-semibold">
                Destructive
              </div>
              <p className="text-sm text-muted-foreground">--destructive: #ef4444</p>
            </div>
            <div className="space-y-2">
              <div className="h-20 bg-success rounded-md flex items-center justify-center text-white font-semibold">
                Success
              </div>
              <p className="text-sm text-muted-foreground">--success: #22c55e</p>
            </div>
            <div className="space-y-2">
              <div className="h-20 bg-card rounded-md border border-border flex items-center justify-center text-foreground font-semibold">
                Card
              </div>
              <p className="text-sm text-muted-foreground">--card: #faf9fb</p>
            </div>
          </CardContent>
        </Card>

        {/* Buttons */}
        <Card>
          <CardHeader>
            <CardTitle>Button Variants</CardTitle>
            <CardDescription>All available button styles</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex flex-wrap gap-2">
              <Button variant="default">Default</Button>
              <Button variant="outline">Outline</Button>
              <Button variant="destructive">Destructive</Button>
              <Button variant="ghost">Ghost</Button>
            </div>
            <div className="flex flex-wrap gap-2">
              <Button variant="default" size="sm">Small</Button>
              <Button variant="default" size="lg">Large</Button>
              <Button variant="default" size="icon">🎨</Button>
            </div>
            <div className="flex flex-wrap gap-2">
              <Button variant="default" disabled>Disabled</Button>
              <Button variant="outline" disabled>Disabled Outline</Button>
            </div>
          </CardContent>
        </Card>

        {/* Form Elements */}
        <Card>
          <CardHeader>
            <CardTitle>Form Elements</CardTitle>
            <CardDescription>Input and label components</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="email">Email</Label>
              <Input
                id="email"
                type="email"
                placeholder="your@email.com"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="password">Password</Label>
              <Input
                id="password"
                type="password"
                placeholder="••••••••"
              />
            </div>
          </CardContent>
        </Card>

        {/* Typography */}
        <Card>
          <CardHeader>
            <CardTitle>Typography</CardTitle>
            <CardDescription>Font families and text styles</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <p className="text-sm text-muted-foreground mb-2">Heading (Sans)</p>
              <h2 className="text-2xl font-heading font-semibold text-foreground-heading">
                This is a heading
              </h2>
            </div>
            <div>
              <p className="text-sm text-muted-foreground mb-2">Body (Sans)</p>
              <p className="text-base text-foreground">
                This is body text using the sans-serif font stack.
              </p>
            </div>
            <div>
              <p className="text-sm text-muted-foreground mb-2">Code (Mono)</p>
              <code className="bg-code-bg text-foreground-heading px-2 py-1 rounded text-sm font-mono">
                const message = "Hello, World!"
              </code>
            </div>
          </CardContent>
        </Card>

        {/* Info */}
        <div className="text-center text-sm text-muted-foreground p-4 border border-border rounded-lg bg-card">
          <p>✅ All tokens preserved and remapped to Tailwind</p>
          <p>Test dark mode using <code className="bg-code-bg px-2 py-1 rounded">document.documentElement.classList.toggle('dark')</code></p>
        </div>
      </div>
    </div>
  )
}
