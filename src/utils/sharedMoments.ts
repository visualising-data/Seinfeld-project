const sharedMoments = $derived.by(() => {
    const episodes = []
    const otherChars = activeCharacter.slice(1)

    episodesData.forEach(d => {
      const charsData = d.data.filter(e => e.eventCategory === 'CHARACTERS')
      const locationsData = d.data.filter(e => e.eventCategory === 'LOCATION')
      const laughterData = d.data.filter(e => e.eventCategory === 'CAUSES THE LAUGH')
      const groupedCharsData = []
      const groupedLaughterData = []

      charsData.forEach(c => {
        const currentTime = c.eventTimeSeconds
        if (c.eventAttribute === activeCharacter[0]) {
          let hasAllOtherChars = true
          otherChars.forEach(c => {
            if (!charsData.find(m => m.eventAttribute === c && m.eventTimeSeconds === currentTime)) {
              hasAllOtherChars = false
            }
          })
          
          if (hasAllOtherChars) {
            groupedCharsData.push({
              ...c,
              eventAttribute: activeCharacter.map(c => c),
              location: locationsData.find(m => m.eventTimeSeconds === currentTime).eventAttribute
            })

            if (laughterData.find(m => m.eventTimeSeconds === currentTime && activeCharacter.includes(m.eventAttribute))) {
              groupedLaughterData.push({
                ...c,
                eventAttribute: activeCharacter.map(c => c),
                location: locationsData.find(m => m.eventTimeSeconds === currentTime).eventAttribute
              })
            }
          }
        }
      })

      let start
      let currentTime
      let currentScene = 1
      const aggregatedSharedMoments = []
      groupedCharsData.forEach((d, i) => {
        if (!start && !currentTime) {
          start = +d.eventTimeSeconds
          currentTime = +d.eventTimeSeconds
        } else if (+d.eventTimeSeconds > currentTime + 5 || i === groupedCharsData.length - 1 || +d.sceneNumber !== currentScene) {
          aggregatedSharedMoments.push({
            start: start - 5,
            duration: currentTime - start,
            sceneNum: currentScene,
            location: d.location
          })
          start = +d.eventTimeSeconds
          currentTime = +d.eventTimeSeconds
          currentScene = +d.sceneNumber
        } else if (+d.eventTimeSeconds === currentTime + 5) {
          currentTime = +d.eventTimeSeconds
        }
      })

      start = undefined
      currentTime = undefined
      currentScene = 1
      const aggregatedLaughterMoments = []
      groupedLaughterData.forEach((d, i) => {
        if (!start && !currentTime) {
          start = +d.eventTimeSeconds
          currentTime = +d.eventTimeSeconds
        } else if (+d.eventTimeSeconds > currentTime + 5 || i === groupedLaughterData.length - 1 || +d.sceneNumber !== currentScene) {
          if (currentTime - start > 0) {
            aggregatedLaughterMoments.push({
              start: start - 5,
              duration: currentTime - start,
              sceneNum: currentScene,
              location: d.location
            })
          }

          start = +d.eventTimeSeconds
          currentTime = +d.eventTimeSeconds
          currentScene = +d.sceneNumber
        } else if (+d.eventTimeSeconds === currentTime + 5) {
          currentTime = +d.eventTimeSeconds
        }
      })

      episodes.push({
        season: d.season,
        episode: d.episode,
        duration: d.duration,
        onScreenTogether: aggregatedSharedMoments,
        causeLaughterTogether: aggregatedLaughterMoments,
        maxSceneWithSharedLaughter: currentScene
      })
    })

    return episodes
  })

const hierarchicalData = $derived.by(() => {
    const data = {
      name: 'All episodes',
      children: []
    }

    sharedMoments.forEach(e => {
      const scenes = []
      e.causeLaughterTogether.forEach(l => {
        if (!scenes.includes(l.sceneNum)) scenes.push(l.sceneNum)
      })
      
      const episodeData = {
        name: `season-${e.season}-episode-${e.episode}`,
        season: e.season,
        episode: e.episode,
        duration: e.duration,
        children: scenes.map(s => {
          return {
            name: `season-${e.season}-episode-${e.episode}-scene-${s}`,
            season: e.season,
            episode: e.episode,
            scene: s,
            children: e.causeLaughterTogether.filter(d => d.sceneNum === s)
          }
        })
      }

      data.children.push(episodeData)
    })
    

    return data
  })