<script lang="ts">
  import * as d3 from 'd3'
  import type { NetworkNode, NetworkConnection } from '$lib/db/schema'

  let {
    nodes = [],
    connections = [],
    selectedNodeId = null,
    onselectNode,
    oncreateConnection,
  }: {
    nodes: NetworkNode[]
    connections: NetworkConnection[]
    selectedNodeId: string | null
    onselectNode?: (nodeId: string) => void
    oncreateConnection?: (sourceId: string, targetId: string) => void
  } = $props()

  let container: HTMLDivElement

  const typeColors: Record<string, string> = {
    person: '#7c3aed',
    group: '#3b82f6',
    institution: '#f59e0b',
    media: '#10b981',
  }

  const typeLabels: Record<string, string> = {
    person: 'Osoba',
    group: 'Grupa',
    institution: 'Instytucja',
    media: 'Media',
  }

  interface SimNode extends NetworkNode {
    x?: number
    y?: number
    fx?: number | null
    fy?: number | null
  }

  interface SimLink {
    source: string | SimNode
    target: string | SimNode
    influenceStrength: number
    type: NetworkConnection['type']
    bidirectional: boolean
    id: string
  }

  let simNodes: SimNode[] = $derived(
    nodes.map(n => ({ ...n }))
  )

  let simLinks: SimLink[] = $derived(
    connections.map(c => ({
      source: c.sourceId,
      target: c.targetId,
      influenceStrength: c.influenceStrength,
      type: c.type,
      bidirectional: c.bidirectional,
      id: c.id,
    }))
  )

  $effect(() => {
    if (!container) return

    const _simNodes = simNodes
    const _simLinks = simLinks

    d3.select(container).selectAll('svg').remove()

    const width = container.clientWidth || 600
    const height = container.clientHeight || 500

    const svg = d3.select(container)
      .append('svg')
      .attr('width', '100%')
      .attr('height', '100%')
      .attr('viewBox', [0, 0, width, height])
      .style('background', 'transparent')

    const defs = svg.append('defs')

    defs.append('marker')
      .attr('id', 'arrow-positive')
      .attr('viewBox', '0 -5 10 10')
      .attr('refX', 22)
      .attr('refY', 0)
      .attr('markerWidth', 7)
      .attr('markerHeight', 7)
      .attr('orient', 'auto')
      .append('path')
      .attr('d', 'M0,-5L10,0L0,5')
      .attr('fill', '#4ade80')
      .attr('opacity', 0.7)

    defs.append('marker')
      .attr('id', 'arrow-negative')
      .attr('viewBox', '0 -5 10 10')
      .attr('refX', 22)
      .attr('refY', 0)
      .attr('markerWidth', 7)
      .attr('markerHeight', 7)
      .attr('orient', 'auto')
      .append('path')
      .attr('d', 'M0,-5L10,0L0,5')
      .attr('fill', '#f87171')
      .attr('opacity', 0.7)

    defs.append('marker')
      .attr('id', 'arrow-positive-bidi')
      .attr('viewBox', '0 -5 10 10')
      .attr('refX', 22)
      .attr('refY', 0)
      .attr('markerWidth', 7)
      .attr('markerHeight', 7)
      .attr('orient', 'auto-start-reverse')
      .append('path')
      .attr('d', 'M0,-5L10,0L0,5')
      .attr('fill', '#4ade80')
      .attr('opacity', 0.7)

    defs.append('marker')
      .attr('id', 'arrow-negative-bidi')
      .attr('viewBox', '0 -5 10 10')
      .attr('refX', 22)
      .attr('refY', 0)
      .attr('markerWidth', 7)
      .attr('markerHeight', 7)
      .attr('orient', 'auto-start-reverse')
      .append('path')
      .attr('d', 'M0,-5L10,0L0,5')
      .attr('fill', '#f87171')
      .attr('opacity', 0.7)

    const zoomGroup = svg.append('g').attr('class', 'zoom-group')

    const linkGroup = zoomGroup.append('g').attr('class', 'links')
    const nodeGroup = zoomGroup.append('g').attr('class', 'nodes')

    const simulation = d3.forceSimulation<SimNode>(_simNodes)
      .force('link', d3.forceLink<SimNode, SimLink>(_simLinks)
        .id(d => d.id)
        .distance(120))
      .force('charge', d3.forceManyBody().strength(-400))
      .force('center', d3.forceCenter(width / 2, height / 2))
      .force('collision', d3.forceCollide<SimNode>().radius(d => {
        const count = _simLinks.filter(l => {
          const src = typeof l.source === 'string' ? l.source : l.source.id
          const tgt = typeof l.target === 'string' ? l.target : l.target.id
          return src === d.id || tgt === d.id
        }).length
        return Math.max(20, Math.min(40, count * 4 + 16))
      }))

    const link = linkGroup
      .selectAll('line')
      .data(_simLinks, (d: any) => d.id)
      .join('line')
      .attr('stroke-width', d => Math.max(1, Math.abs(d.influenceStrength) * 4))
      .attr('stroke', d => d.influenceStrength >= 0 ? '#4ade80' : '#f87171')
      .attr('opacity', 0.55)
      .attr('marker-end', d => {
        const isPos = d.influenceStrength >= 0
        if (d.bidirectional) return isPos ? 'url(#arrow-positive-bidi)' : 'url(#arrow-negative-bidi)'
        return isPos ? 'url(#arrow-positive)' : 'url(#arrow-negative)'
      })

    const node = nodeGroup
      .selectAll('g')
      .data(_simNodes, (d: any) => d.id)
      .join('g')
      .attr('cursor', 'pointer')

    node.append('circle')
      .attr('r', d => {
        const count = _simLinks.filter(l => {
          const src = typeof l.source === 'string' ? l.source : l.source.id
          const tgt = typeof l.target === 'string' ? l.target : l.target.id
          return src === d.id || tgt === d.id
        }).length
        return Math.max(8, Math.min(22, count * 3 + 8))
      })
      .attr('fill', d => typeColors[d.type] || '#7c3aed')
      .attr('stroke', d => d.id === selectedNodeId ? '#fff' : 'transparent')
      .attr('stroke-width', 2.5)
      .attr('stroke-dasharray', d => d.id === selectedNodeId ? 'none' : 'none')
      .style('filter', d => d.id === selectedNodeId ? 'brightness(1.3)' : 'none')

    node.append('text')
      .text(d => d.name)
      .attr('text-anchor', 'middle')
      .attr('dy', 32)
      .attr('fill', 'var(--sl-color-gray-3, #9ca3af)')
      .attr('font-size', '11px')
      .attr('font-family', 'system-ui, sans-serif')
      .attr('pointer-events', 'none')

    node.append('title')
      .text(d => `${d.name} (${typeLabels[d.type]})`)

    let dragged = false

    node.call(
      d3.drag<SVGGElement, SimNode>()
        .on('start', (event, d) => {
          if (!event.active) simulation.alphaTarget(0.3).restart()
          d.fx = d.x
          d.fy = d.y
          dragged = false
        })
        .on('drag', (event, d) => {
          d.fx = event.x
          d.fy = event.y
          dragged = true
        })
        .on('end', (event, d) => {
          if (!event.active) simulation.alphaTarget(0)
          if (!dragged) {
            d.fx = null
            d.fy = null
          }
        }) as any
    )

    node.on('click', (event: MouseEvent, d) => {
      if (dragged) {
        dragged = false
        return
      }
      event.stopPropagation()
      if (event.shiftKey && selectedNodeId && selectedNodeId !== d.id) {
        oncreateConnection?.(selectedNodeId, d.id)
      } else {
        onselectNode?.(d.id)
      }
    })

    svg.on('click', (event: MouseEvent) => {
      if ((event.target as HTMLElement)?.tagName === 'svg') {
        onselectNode?.('')
      }
    })

    const zoom = d3.zoom<SVGSVGElement, unknown>()
      .scaleExtent([0.15, 5])
      .on('zoom', (event) => {
        zoomGroup.attr('transform', event.transform)
      })

    svg.call(zoom)

    simulation.on('tick', () => {
      link
        .attr('x1', d => (d.source as SimNode).x!)
        .attr('y1', d => (d.source as SimNode).y!)
        .attr('x2', d => (d.target as SimNode).x!)
        .attr('y2', d => (d.target as SimNode).y!)

      node.attr('transform', d => `translate(${d.x},${d.y})`)
    })

    return () => {
      simulation.stop()
    }
  })

  $effect(() => {
    if (!container) return
    const selId = selectedNodeId
    const svg = d3.select(container).select('svg')
    if (svg.empty()) return

    svg.selectAll('.nodes g circle')
      .attr('stroke', d => (d as unknown as SimNode).id === selId ? '#fff' : 'transparent')
      .attr('stroke-width', 2.5)
      .style('filter', d => (d as unknown as SimNode).id === selId ? 'brightness(1.3)' : 'none')
  })
</script>

<div bind:this={container} class="graph-container">
</div>

<style>
  .graph-container {
    width: 100%;
    height: 100%;
    min-height: 500px;
    overflow: hidden;
  }

  .graph-container :global(svg) {
    display: block;
  }

  .graph-container :global(svg text) {
    user-select: none;
  }
</style>
