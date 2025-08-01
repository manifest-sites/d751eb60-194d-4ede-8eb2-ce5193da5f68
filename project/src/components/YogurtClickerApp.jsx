import { useState, useEffect } from 'react'
import { Button, Card, Progress, message, Space, Badge } from 'antd'
import { YogurtProgress } from '../entities/YogurtProgress'

function YogurtClickerApp() {
  const [yogurtPoints, setYogurtPoints] = useState(0)
  const [totalClicks, setTotalClicks] = useState(0)
  const [currentFlavor, setCurrentFlavor] = useState('vanilla')
  const [unlockedFlavors, setUnlockedFlavors] = useState(['vanilla'])
  const [upgrades, setUpgrades] = useState({ spoon: 0, mixer: 0, machine: 0 })
  const [autoYogurt, setAutoYogurt] = useState(0)
  const [clickPower, setClickPower] = useState(1)

  const flavors = {
    vanilla: { name: 'Vanilla', color: '#FFF8DC', unlock: 0, emoji: '🥛' },
    strawberry: { name: 'Strawberry', color: '#FFB6C1', unlock: 100, emoji: '🍓' },
    blueberry: { name: 'Blueberry', color: '#E6E6FA', unlock: 500, emoji: '🫐' },
    chocolate: { name: 'Chocolate', color: '#D2691E', unlock: 1000, emoji: '🍫' },
    mango: { name: 'Mango', color: '#FFD700', unlock: 2500, emoji: '🥭' },
    coconut: { name: 'Coconut', color: '#F5F5DC', unlock: 5000, emoji: '🥥' }
  }

  const upgradeTypes = {
    spoon: { name: 'Silver Spoon', baseCost: 10, power: 1, description: '+1 yogurt per click' },
    mixer: { name: 'Electric Mixer', baseCost: 100, power: 5, description: '+5 yogurt per second' },
    machine: { name: 'Yogurt Machine', baseCost: 500, power: 25, description: '+25 yogurt per second' }
  }

  const getUpgradeCost = (type, currentLevel) => {
    return Math.floor(upgradeTypes[type].baseCost * Math.pow(1.15, currentLevel))
  }

  const handleYogurtClick = () => {
    const pointsGained = clickPower
    setYogurtPoints(prev => prev + pointsGained)
    setTotalClicks(prev => prev + 1)
    
    // Check for flavor unlocks
    Object.entries(flavors).forEach(([flavorKey, flavor]) => {
      if (yogurtPoints + pointsGained >= flavor.unlock && !unlockedFlavors.includes(flavorKey)) {
        setUnlockedFlavors(prev => [...prev, flavorKey])
        message.success(`New flavor unlocked: ${flavor.name} ${flavor.emoji}`)
      }
    })
  }

  const purchaseUpgrade = (type) => {
    const cost = getUpgradeCost(type, upgrades[type])
    if (yogurtPoints >= cost) {
      setYogurtPoints(prev => prev - cost)
      setUpgrades(prev => ({
        ...prev,
        [type]: prev[type] + 1
      }))
      message.success(`Purchased ${upgradeTypes[type].name}!`)
    } else {
      message.error('Not enough yogurt points!')
    }
  }

  const switchFlavor = (flavorKey) => {
    if (unlockedFlavors.includes(flavorKey)) {
      setCurrentFlavor(flavorKey)
      message.success(`Switched to ${flavors[flavorKey].name} yogurt!`)
    }
  }

  const saveProgress = async () => {
    try {
      const progressData = {
        yogurtPoints,
        totalClicks,
        currentFlavor,
        unlockedFlavors,
        upgrades,
        lastSaved: new Date().toISOString()
      }
      
      const result = await YogurtProgress.create(progressData)
      if (result.success) {
        message.success('Progress saved!')
      }
    } catch (error) {
      message.error('Failed to save progress')
    }
  }

  const loadProgress = async () => {
    try {
      const result = await YogurtProgress.list()
      if (result.success && result.data.length > 0) {
        const latest = result.data[result.data.length - 1]
        setYogurtPoints(latest.yogurtPoints || 0)
        setTotalClicks(latest.totalClicks || 0)
        setCurrentFlavor(latest.currentFlavor || 'vanilla')
        setUnlockedFlavors(latest.unlockedFlavors || ['vanilla'])
        setUpgrades(latest.upgrades || { spoon: 0, mixer: 0, machine: 0 })
      }
    } catch (error) {
      console.error('Failed to load progress:', error)
    }
  }

  // Auto-save every 30 seconds
  useEffect(() => {
    const interval = setInterval(saveProgress, 30000)
    return () => clearInterval(interval)
  }, [yogurtPoints, totalClicks, currentFlavor, unlockedFlavors, upgrades])

  // Load progress on mount
  useEffect(() => {
    loadProgress()
  }, [])

  // Calculate click power and auto yogurt
  useEffect(() => {
    setClickPower(1 + upgrades.spoon)
    setAutoYogurt(upgrades.mixer * 5 + upgrades.machine * 25)
  }, [upgrades])

  // Auto yogurt generation
  useEffect(() => {
    if (autoYogurt > 0) {
      const interval = setInterval(() => {
        setYogurtPoints(prev => prev + autoYogurt)
      }, 1000)
      return () => clearInterval(interval)
    }
  }, [autoYogurt])

  const currentFlavorData = flavors[currentFlavor]

  return (
    <div className="min-h-screen bg-gradient-to-br from-pink-50 to-purple-100 p-4">
      <div className="max-w-6xl mx-auto">
        <div className="text-center mb-8">
          <h1 className="text-5xl font-bold text-gray-800 mb-2">🥛 Yogurt Clicker 🥛</h1>
          <p className="text-gray-600">Click to make delicious yogurt!</p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Main Yogurt Container */}
          <div className="lg:col-span-2">
            <Card className="shadow-lg text-center">
              <div className="mb-6">
                <h2 className="text-2xl font-semibold mb-4">
                  {currentFlavorData.emoji} {currentFlavorData.name} Yogurt
                </h2>
                
                {/* Yogurt Container */}
                <div 
                  className="mx-auto w-64 h-64 rounded-full cursor-pointer transition-transform hover:scale-105 active:scale-95 flex items-center justify-center text-6xl shadow-lg border-8 border-white"
                  style={{ backgroundColor: currentFlavorData.color }}
                  onClick={handleYogurtClick}
                >
                  {currentFlavorData.emoji}
                </div>
                
                <div className="mt-6">
                  <div className="text-4xl font-bold text-gray-800 mb-2">
                    {yogurtPoints.toLocaleString()} yogurt points
                  </div>
                  <div className="text-lg text-gray-600">
                    {totalClicks.toLocaleString()} total clicks
                  </div>
                  {autoYogurt > 0 && (
                    <div className="text-lg text-green-600 font-semibold">
                      +{autoYogurt} yogurt/second
                    </div>
                  )}
                </div>
              </div>

              {/* Flavor Selection */}
              <div className="mb-6">
                <h3 className="text-xl font-semibold mb-4">Yogurt Flavors</h3>
                <div className="flex flex-wrap gap-2 justify-center">
                  {Object.entries(flavors).map(([flavorKey, flavor]) => (
                    <Button
                      key={flavorKey}
                      type={currentFlavor === flavorKey ? "primary" : "default"}
                      size="large"
                      disabled={!unlockedFlavors.includes(flavorKey)}
                      onClick={() => switchFlavor(flavorKey)}
                      className="flex items-center gap-2"
                    >
                      {flavor.emoji} {flavor.name}
                      {!unlockedFlavors.includes(flavorKey) && (
                        <span className="text-xs">({flavor.unlock} pts)</span>
                      )}
                    </Button>
                  ))}
                </div>
              </div>

              <Button type="primary" size="large" onClick={saveProgress}>
                💾 Save Progress
              </Button>
            </Card>
          </div>

          {/* Upgrades Panel */}
          <div className="space-y-6">
            <Card title="🛠️ Upgrades" className="shadow-lg">
              <div className="space-y-4">
                {Object.entries(upgradeTypes).map(([type, upgrade]) => {
                  const cost = getUpgradeCost(type, upgrades[type])
                  const canAfford = yogurtPoints >= cost
                  const owned = upgrades[type]
                  
                  return (
                    <div key={type} className="border rounded-lg p-3">
                      <div className="flex justify-between items-start mb-2">
                        <div>
                          <div className="font-semibold">
                            {upgrade.name}
                            {owned > 0 && (
                              <Badge count={owned} className="ml-2" />
                            )}
                          </div>
                          <div className="text-sm text-gray-600">{upgrade.description}</div>
                        </div>
                      </div>
                      <Button
                        type="primary"
                        block
                        disabled={!canAfford}
                        onClick={() => purchaseUpgrade(type)}
                        className={!canAfford ? 'opacity-50' : ''}
                      >
                        Buy for {cost.toLocaleString()} points
                      </Button>
                    </div>
                  )
                })}
              </div>
            </Card>

            <Card title="📊 Stats" className="shadow-lg">
              <div className="space-y-3">
                <div className="flex justify-between">
                  <span>Click Power:</span>
                  <span className="font-semibold">{clickPower}</span>
                </div>
                <div className="flex justify-between">
                  <span>Auto Yogurt/sec:</span>
                  <span className="font-semibold">{autoYogurt}</span>
                </div>
                <div className="flex justify-between">
                  <span>Flavors Unlocked:</span>
                  <span className="font-semibold">{unlockedFlavors.length}/{Object.keys(flavors).length}</span>
                </div>
                <div className="flex justify-between">
                  <span>Total Upgrades:</span>
                  <span className="font-semibold">{Object.values(upgrades).reduce((a, b) => a + b, 0)}</span>
                </div>
              </div>

              <div className="mt-4">
                <div className="text-sm text-gray-600 mb-2">Progress to next flavor:</div>
                {(() => {
                  const nextFlavor = Object.entries(flavors).find(([key, flavor]) => 
                    !unlockedFlavors.includes(key) && flavor.unlock > yogurtPoints
                  )
                  if (nextFlavor) {
                    const [key, flavor] = nextFlavor
                    const progress = (yogurtPoints / flavor.unlock) * 100
                    return (
                      <div>
                        <div className="text-sm mb-1">
                          {flavor.emoji} {flavor.name} ({flavor.unlock} pts)
                        </div>
                        <Progress percent={Math.min(progress, 100)} strokeColor="#ff69b4" />
                      </div>
                    )
                  }
                  return <div className="text-green-600 font-semibold">All flavors unlocked! 🎉</div>
                })()}
              </div>
            </Card>
          </div>
        </div>
      </div>
    </div>
  )
}

export default YogurtClickerApp