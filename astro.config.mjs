// @ts-check
import { defineConfig } from 'astro/config';
import starlight from '@astrojs/starlight';
import svelte from '@astrojs/svelte';
import { fileURLToPath } from 'node:url';

export default defineConfig({
	vite: {
		resolve: {
			alias: {
				'$lib': fileURLToPath(new URL('./src/lib', import.meta.url)),
			},
		},
	},
	integrations: [
		svelte(),
		starlight({
			title: 'Mind Harness',
			social: [{ icon: 'github', label: 'GitHub', href: 'https://github.com/withastro/starlight' }],
			sidebar: [
				{
					label: 'Teoria User Harness',
					items: [
						{ label: 'Przegląd', slug: 'theory/overview' },
						{ label: 'Filtr Epistemiczny (Ω)', slug: 'theory/omega-filter' },
						{ label: 'Dynamika Przekonań (γ)', slug: 'theory/belief-dynamics' },
						{ label: 'Polityka Decyzyjna (π)', slug: 'theory/decision-policy' },
						{ label: 'Zagnieżdżone Przekonania', slug: 'theory/nested-beliefs' },
						{ label: 'Dynamika Grupowa', slug: 'theory/group-dynamics' },
					],
				},
				{
					label: 'Aplikacja',
					items: [
						{ label: 'Pierwsze Kroki', slug: 'app/getting-started' },
						{ label: 'Moduł Przekonań', slug: 'app/beliefs' },
						{ label: 'Dziennik Obserwacji', slug: 'app/observations' },
						{ label: 'Mapa Sieci', slug: 'app/network' },
						{ label: 'Bramka Decyzyjna', slug: 'app/decisions' },
						{ label: 'Analiza Wpływów', slug: 'app/analysis' },
					],
				},
				{
					label: 'Dashboard',
					link: '/app/dashboard',
				},
			],
		}),
	],
});
