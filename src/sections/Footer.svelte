<script>
	const publicationYear = 2026;
	const currentYear = new Date().getFullYear();
	const yearDisplay = currentYear > publicationYear ? `${publicationYear}–${currentYear}` : `${publicationYear}`;
</script>

<footer class="bg-black text-white">
	<div class="container px-12 py-3 text-xs md:text-sm">
		Copyright © {yearDisplay} Visualising Data Ltd - All rights reserved
	</div>
</footer>
