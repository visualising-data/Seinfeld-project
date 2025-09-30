export const formatTime = (timeString: string) => {
  const min = +timeString.slice(0, 2);
  const sec = +timeString.slice(3);
  return min * 60 + sec;
}

export const formatTimeLabel = (time: number) => {
  const minHoveredTime = Math.floor(time / 60);
	const secHoveredTime = Math.floor(time - minHoveredTime * 60);
	return `${minHoveredTime < 10 ? '0' : ''}${minHoveredTime}:${secHoveredTime < 10 ? '0' : ''}${secHoveredTime}`;
}