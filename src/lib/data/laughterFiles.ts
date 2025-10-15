const host = 'https://amdufour.github.io/hosted-data/apis/laughter/';
const ext = '.m4a';

export const laughterFiles = {
	laughter_1: `${host}Laughter1${ext}`,
	laughter_2: `${host}Laughter2${ext}`,
	laughter_3: `${host}Laughter3${ext}`,
	laughter_4: `${host}Laughter4${ext}`,
	laughter_5: `${host}Laughter5${ext}`,
	laughter_6: `${host}Laughter6${ext}`,
	laughter_7: `${host}Laughter7${ext}`,
	laughter_8: `${host}Laughter8${ext}`,
};

export const getRandomLaughterFile = () => {
	const min = 1;
  const max = 8;
  const num = Math.floor(Math.random() * (max - min + 1) + min);

	return `laughter_${num}`
}