# shadcn/ui Setup Commands

## Step 1: Install Dependencies
Run the following command to install the new dependencies:
```bash
npm install @radix-ui/react-slot class-variance-authority clsx tailwind-merge next-themes
```

## Step 2: Initialize shadcn/ui (Optional)
If you want to use the CLI for adding more components later:
```bash
npx shadcn-ui@latest init
```
Note: The configuration is already set up in `components.json`

## Step 3: Add More shadcn/ui Components
As needed for future phases, you can add components like:
```bash
npx shadcn-ui@latest add card
npx shadcn-ui@latest add input
npx shadcn-ui@latest add select
npx shadcn-ui@latest add dialog
```

## Step 4: Test Theme Switching
1. Start the development server: `npm run dev`
2. Check that the theme toggle appears in the navbar
3. Verify that colors switch properly between light and dark modes
4. Ensure existing functionality (language switching) still works

## Step 5: Verify Color Consistency
- Check that `#984A02` appears as the primary color in light mode
- Verify that `#F0D586` appears as the secondary/accent color
- Ensure all existing components maintain their visual appearance
