"use client"

import * as React from "react"
import { Image as ImageIcon } from "lucide-react"
import { cn } from "@/lib/utils"
import { Slide } from "@/types/editor"
import { 
  BarChart, 
  Bar, 
  PieChart, 
  Pie, 
  LineChart, 
  Line, 
  AreaChart,
  Area,
  RadarChart,
  Radar,
  RadialBarChart,
  RadialBar,
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  Cell,
  ResponsiveContainer,
  PolarGrid,
  PolarAngleAxis
} from 'recharts'

export function SlidePreview({ slide, scale = 1 }: { slide: Slide, scale?: number }) {
  return (
    <div 
      className="w-full h-full relative overflow-hidden pointer-events-none select-none"
      style={{ 
        backgroundColor: slide.bgColor || '#ffffff',
        backgroundImage: slide.bgImage ? `url(${slide.bgImage})` : 'none',
        backgroundSize: 'cover',
        backgroundPosition: 'center',
        containerType: 'size'
      } as any}
    >
      <div 
        className="absolute inset-0 flex items-center justify-center p-[2%]"
      >
        <div 
          className="relative w-full aspect-video shadow-2xl origin-center"
          style={{ 
            transform: scale !== 1 ? `scale(${scale})` : 'none'
          }}
        >
          {/* Elements Rendering - using percentages for absolute responsiveness */}
          {slide.elements.map((el) => {
            // Convert 1024x576 coordinates to percentages
            const left = (el.x / 1024) * 100;
            const top = (el.y / 576) * 100;
            const width = (el.width / 1024) * 100;
            const height = (el.height / 576) * 100;
            
            // Calculate responsive font size using container query units (cqw)
            const baseFontSize = el.fontSize || 24;
            const responsiveFontSize = `${(baseFontSize / 1024) * 100}cqw`;
            
            return (
              <div
                key={el.id}
                className={cn(
                  "overflow-hidden absolute flex items-center",
                  el.type === 'text' ? "leading-tight" : ""
                )}
                style={{
                  left: `${left}%`,
                  top: `${top}%`,
                  width: el.type === 'table' ? 'fit-content' : `${width}%`,
                  height: el.type === 'image' || el.type === 'shape' || el.type.includes('chart') ? `${height}%` : 'auto',
                  justifyContent: el.textAlign === 'center' ? 'center' : el.textAlign === 'right' ? 'flex-end' : 'flex-start',
                  textAlign: el.textAlign || 'left',
                  fontSize: el.type === 'text' ? responsiveFontSize : undefined,
                  color: el.color || 'inherit',
                  fontFamily: el.fontFamily,
                  fontWeight: el.fontWeight || 'normal',
                  lineHeight: 1.2
                }}
              >
                {el.type === 'text' && (
                  <div className="w-full">
                    {el.content}
                  </div>
                )}
                {el.type === 'table' && (
                  <div 
                    className="w-full h-fit overflow-hidden rounded-[1cqw] border transition-all"
                    style={{ 
                        backgroundColor: el.tableBgColor || 'rgba(255,255,255,0.8)',
                        borderColor: el.borderColor || 'rgba(0,0,0,0.1)',
                        boxShadow: '0 5px 15px rgba(0,0,0,0.05)'
                    }}
                  >
                    <table className="w-full border-collapse">
                      <tbody>
                        {(el.tableData || []).length > 0 ? (
                          el.tableData!.map((row: any[], rowIndex: number) => (
                            <tr key={rowIndex}>
                              {row.map((cell: any, colIndex: number) => (
                                <td 
                                  key={colIndex} 
                                  className={cn(
                                    "p-[0.8cqw] text-[0.8cqw] font-normal text-center align-middle border-b border-r last:border-r-0",
                                    cell.isHeader ? "font-black uppercase tracking-wider bg-black/5" : ""
                                  )}
                                  style={{ 
                                      borderColor: el.borderColor || 'rgba(0,0,0,0.1)',
                                      color: el.color || 'inherit'
                                  }}
                                >
                                  {cell.text || cell}
                                </td>
                              ))}
                            </tr>
                          ))
                        ) : (el.content || []).map((row: any[], rowIndex: number) => (
                          <tr key={rowIndex}>
                            {row.map((cell: string, colIndex: number) => (
                              <td 
                                key={colIndex} 
                                className="p-[0.8cqw] text-[0.8cqw] font-normal text-center align-middle border-b border-r last:border-r-0"
                                style={{ 
                                    borderColor: el.borderColor || 'rgba(0,0,0,0.1)',
                                    color: el.color || 'inherit'
                                }}
                              >
                                {cell}
                              </td>
                            ))}
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                )}
                {el.type === 'image' && (
                  <div className="w-full h-full bg-muted/20 flex items-center justify-center">
                    {el.src && el.src !== 'loading' ? (
                      <img 
                        src={el.src} 
                        className="w-full h-full" 
                        style={{ objectFit: el.objectFit || 'cover' }}
                      />
                    ) : (
                      <ImageIcon className="size-[20%] text-primary/20" />
                    )}
                  </div>
                )}
                {el.type === 'shape' && (
                  <div 
                      className="w-full h-full"
                      style={{ 
                          backgroundColor: el.color || 'var(--primary)',
                          borderRadius: el.shapeType === 'circle' ? '50%' : '0px',
                          opacity: el.opacity ?? 1
                      }}
                  />
                )}
                {el.type.includes('chart') && (
                  <div className="w-full h-full flex flex-col bg-background/30 rounded-[1.5cqw] border border-border/10 backdrop-blur-sm overflow-hidden p-[1cqw]">
                      {el.chartTitle && (
                          <div className="text-[1cqw] font-black uppercase tracking-[0.2em] mb-[1cqw] text-center opacity-50">
                              {el.chartTitle}
                          </div>
                      )}
                      <div className="flex-1 w-full min-h-0 pointer-events-none">
                          <ResponsiveContainer width="100%" height="100%">
                              {el.type === 'bar-chart' ? (
                                  <BarChart data={el.chartData || []}>
                                      <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="rgba(0,0,0,0.05)" />
                                      <XAxis dataKey="label" fontSize="0.8cqw" tick={{ fill: 'currentColor', opacity: 0.5 }} axisLine={false} tickLine={false} />
                                      <YAxis fontSize="0.8cqw" tick={{ fill: 'currentColor', opacity: 0.5 }}  axisLine={false} tickLine={false} />
                                      <Bar dataKey="value" radius={[4, 4, 0, 0]}>
                                          {(el.chartData || []).map((entry, index) => (
                                              <Cell key={`cell-${index}`} fill={entry.color || el.color || '#8884d8'} />
                                          ))}
                                      </Bar>
                                  </BarChart>
                              ) : el.type === 'pie-chart' ? (
                                  <PieChart>
                                      <Pie
                                          data={el.chartData || []}
                                          cx="50%"
                                          cy="50%"
                                          innerRadius="40%"
                                          outerRadius="80%"
                                          paddingAngle={5}
                                          dataKey="value"
                                      >
                                          {(el.chartData || []).map((entry, index) => (
                                              <Cell key={`cell-${index}`} fill={entry.color || '#8884d8'} />
                                          ))}
                                      </Pie>
                                  </PieChart>
                              ) : el.type === 'line-chart' ? (
                                  <LineChart data={el.chartData || []}>
                                      <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="rgba(0,0,0,0.05)" />
                                      <XAxis dataKey="label" fontSize="0.8cqw" tick={{ fill: 'currentColor', opacity: 0.5 }} axisLine={false} tickLine={false} />
                                      <YAxis fontSize="0.8cqw" tick={{ fill: 'currentColor', opacity: 0.5 }} axisLine={false} tickLine={false} />
                                      <Line type="monotone" dataKey="value" stroke={el.color || '#8884d8'} strokeWidth={2} dot={{ r: 2, fill: el.color || '#8884d8' }} />
                                  </LineChart>
                              ) : el.type === 'area-chart' ? (
                                  <AreaChart data={el.chartData || []}>
                                      <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="rgba(0,0,0,0.05)" />
                                      <XAxis dataKey="label" fontSize="0.8cqw" tick={{ fill: 'currentColor', opacity: 0.5 }} axisLine={false} tickLine={false} />
                                      <YAxis fontSize="0.8cqw" tick={{ fill: 'currentColor', opacity: 0.5 }} axisLine={false} tickLine={false} />
                                      <Area type="natural" dataKey="value" stroke={el.color || '#8884d8'} fill={el.color || '#8884d8'} fillOpacity={0.3} />
                                  </AreaChart>
                              ) : el.type === 'radar-chart' ? (
                                  <RadarChart cx="50%" cy="50%" outerRadius="80%" data={el.chartData || []}>
                                      <PolarGrid stroke="rgba(0,0,0,0.1)" />
                                      <PolarAngleAxis dataKey="label" fontSize="0.8cqw" />
                                      <Radar name="Value" dataKey="value" stroke={el.color || '#8884d8'} fill={el.color || '#8884d8'} fillOpacity={0.6} />
                                  </RadarChart>
                              ) : el.type === 'radial-chart' ? (
                                  <RadialBarChart innerRadius="30%" outerRadius="100%" barSize={10} data={el.chartData || []}>
                                      <RadialBar
                                          label={{ position: 'insideStart', fill: '#fff' }}
                                          background
                                          dataKey="value"
                                      />
                                  </RadialBarChart>
                               ) : <div />}
                          </ResponsiveContainer>
                      </div>
                  </div>
                )}
              </div>
            )
          })}
        </div>
      </div>
    </div>
  )
}
