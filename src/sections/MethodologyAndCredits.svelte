<script>
	import BrainIcon from '../icons/BrainIcon.svelte';
	import TableIcon from '../icons/TableIcon.svelte';
	import CodeIcon from '../icons/CodeIcon.svelte';
	import SoundIcon from '../icons/SoundIcon.svelte';
	import PaintIcon from '../icons/PaintIcon.svelte';

	const credits = [
		{ 
			name: 'Andy Kirk', 
			url: 'https://visualisingdata.com/', 
			role: 'Ideation, Data Analysis, Data Visualisation & Original Design',
			imgUrl: 'https://amdufour.github.io/hosted-data/apis/portraits/andy.jpg'
		},
		{ 
			name: 'Anne-Marie Dufour', 
			url: 'https://www.delightfuldata.art/', 
			role: 'Data Visualisation, Digital Design & Development',
			imgUrl: 'https://amdufour.github.io/hosted-data/apis/portraits/annemarie_square_closeup.jpg'
		},
		{ name: 'Loud Numbers', url: 'https://www.loudnumbers.net/', role: 'Sound design, composition, and sonification' },
		{ name: 'Mark Knott', role: 'Illustrations' },
		{ name: 'Rob Barker', role: 'Data Collection Support' }
	];
</script>

<section id="methodology" class="container mt-20 grid grid-cols-1 lg:grid-cols-12">
	<div class="col-span-6 mb-10 px-4">
		<h3>Methodology</h3>
		<div>
			<p>
				The data used in this study did not exist; it had to be manually captured by watching every
				episode and logging the times, categories, and characteristics of different events within
				each.
			</p>
			<p>
				Typically, each episode's data was gathered via two full viewings. The first viewing noted
				the times of discrete scenes starting and finishing, the locations in which the scenes were
				set, and the characters who appeared (and when). The second viewing validated the data and
				recorded which characters caused the laughs (and when). This was a pragmatic solution to
				ensure the best quality data could be obtained in the most efficient way.
			</p>
			<p>
				To help with the efficiency of the data collecting, all periods of screen time were recorded
				in units of 5-second durations. This felt like a sufficient granularity of detail to
				accurately quantify any character's appearance (and aligned with the typical length of time
				recorded for the duration of a laugh). To qualify as a period of screen time, a character
				did not necessarily need to be speaking or even interacting, just that they at least played
				some role in the storyline's progression.
			</p>
			<p>
				Additional data was collected about broadcast dates, viewing figures, plot synopses and
				ratings via <a href="https://www.imdb.com/title/tt0098904/" target="_blank">IMDb</a>.
				Further qualitative enquiries about joke topics, specific patterns in language, and themes
				of representation were tempting to pursue but were considered beyond the scope of the
				enquiry.
			</p>
		</div>
	</div>
	<div class="col-span-1"></div>
	<div class="col-span-5 mb-10 px-4">
		<h3>Credits</h3>
		<div>
			{#each credits as credit, i}
				<div class="my-6 flex">
					<div class="w-12 mt-1">
						{#if i === 0}
							<BrainIcon />
						{:else if i === 1}
							<CodeIcon />
						{:else if i === 2}
							<SoundIcon />
						{:else if i === 3}
							<PaintIcon />
						{:else}
							<TableIcon />
						{/if}
					</div>
					<div class="pl-3 leading-tight">
						{#if credit.name === 'Loud Numbers'}
							<div class="credit-name font-semibold">
								<div class="credit-name-container relative">
									<a href="https://www.miriamquick.com/" target="_blank" >Miriam Quick</a>
									<img
										class="portrait"
										alt="Portrait of Miriam Quick"
										src="https://amdufour.github.io/hosted-data/apis/portraits/miriam_quick.jpg"
									/>
								</div>
								<span class="font-normal">{ ' and '}</span>
								<div class="credit-name-container relative">
									<a href="https://www.duncangeere.com/" target="_blank" >Duncan Geere</a>
									<img
										class="portrait"
										alt="Portrait of Duncan Geere"
										src="https://amdufour.github.io/hosted-data/apis/portraits/duncan_geere.jpeg"
									/>
								</div>
								<span class="font-normal">{'{ '}</span>
								<div class="credit-name-container relative">
									<a href={credit.url} target="_blank" >{credit.name}</a>
									<img
										class="portrait"
										alt="Loud Numbers logo"
										src="https://amdufour.github.io/hosted-data/apis/portraits/loud_numbers.jpg"
									/>
								</div>
								<span class="font-normal">{' }'}</span>
							</div>
						{:else if credit.url}
							<div class="credit-name-container relative">
								<a href={credit.url} target="_blank" class="credit-name font-semibold">{credit.name}</a>
								<img
									class="portrait"
									alt="Portrait of {credit.name}"
									src={credit.imgUrl}
								/>
							</div>
						{:else}
							<div class="credit-name font-semibold">{credit.name}</div>
						{/if}
						<div class="credit-role">{credit.role}</div>
					</div>
				</div>
			{/each}
		</div>
	</div>
</section>

<style>
	.credit-name-container {
		display: inline-block;
	}
	.credit-name {
		font-size: 1.2rem;
	}
	.credit-role {
		font-size: 1rem;
	}
	.portrait {
		position: absolute;
		left: 10px;
		top: -50px;
		width: 75px;
		height: auto;
		border-radius: 50%;
		border: 5px solid #E71D80;
		opacity: 0;
		transition: all 350ms cubic-bezier(0.165, 0.84, 0.44, 1);
		pointer-events: none;
	}
	.credit-name-container:hover .portrait {
		opacity: 1;
		transform: translate(0, -30px) scale(1.2);
	}
</style>