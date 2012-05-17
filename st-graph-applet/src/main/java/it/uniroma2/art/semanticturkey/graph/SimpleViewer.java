package it.uniroma2.art.semanticturkey.graph;

import it.uniroma2.art.semanticturkey.services.OWLServiceClient;
import it.uniroma2.art.semanticturkey.services.OWLVertex;
import it.uniroma2.art.semanticturkey.services.ProjectServiceClient;
import it.uniroma2.art.semanticturkey.services.RepositoryServiceClient;
import it.uniroma2.art.semanticturkey.services.SKOSServiceClient;
import it.uniroma2.art.semanticturkey.services.SKOSVertex;
import it.uniroma2.art.semanticturkey.services.SKOSXLServiceClient;
//import it.uniroma2.art.semanticturkey.services.SKOSServiceClient;
import it.uniroma2.art.semanticturkey.utilities.XMLHelp;

import java.awt.BorderLayout;
import java.awt.Color;
import java.awt.Component;
import java.awt.Dimension;
import java.awt.Font;
import java.awt.GridLayout;
import java.awt.Image;
import java.awt.Point;
import java.awt.event.ActionEvent;
import java.awt.event.ActionListener;
import java.awt.event.ComponentAdapter;
import java.awt.event.ComponentEvent;
import java.awt.event.MouseEvent;
import java.lang.reflect.Constructor;
import java.util.ArrayList;
import java.util.Collection;
import java.util.HashMap;
import java.util.Iterator;
import java.util.List;
import java.util.Map;
import java.util.Vector;

import javax.swing.DefaultListCellRenderer;
import javax.swing.JApplet;
import javax.swing.JButton;
import javax.swing.JComboBox;
import javax.swing.JFrame;
import javax.swing.JList;
import javax.swing.JOptionPane;
import javax.swing.JPanel;
import javax.swing.JRootPane;
import javax.swing.Icon;
import javax.swing.ImageIcon;

import org.apache.commons.collections15.Transformer;

import edu.uci.ics.jung.algorithms.layout.CircleLayout;
import edu.uci.ics.jung.algorithms.layout.DAGLayout;
import edu.uci.ics.jung.algorithms.layout.FRLayout;
import edu.uci.ics.jung.algorithms.layout.FRLayout2;
import edu.uci.ics.jung.algorithms.layout.ISOMLayout;
import edu.uci.ics.jung.algorithms.layout.KKLayout;
import edu.uci.ics.jung.algorithms.layout.Layout;
import edu.uci.ics.jung.algorithms.layout.SpringLayout;
import edu.uci.ics.jung.algorithms.layout.SpringLayout2;
import edu.uci.ics.jung.algorithms.layout.util.Relaxer;
import edu.uci.ics.jung.algorithms.layout.util.VisRunner;
import edu.uci.ics.jung.algorithms.util.IterativeContext;
import edu.uci.ics.jung.graph.DirectedSparseMultigraph;
import edu.uci.ics.jung.graph.Graph;
import edu.uci.ics.jung.graph.ObservableGraph;
import edu.uci.ics.jung.graph.event.GraphEvent;
import edu.uci.ics.jung.graph.event.GraphEventListener;
import edu.uci.ics.jung.graph.util.Graphs;
//import edu.uci.ics.jung.visualization.Layer;
import edu.uci.ics.jung.visualization.LayeredIcon;
import edu.uci.ics.jung.visualization.VisualizationViewer;
import edu.uci.ics.jung.visualization.control.CrossoverScalingControl;
import edu.uci.ics.jung.visualization.control.DefaultModalGraphMouse;
import edu.uci.ics.jung.visualization.control.GraphMouseListener;
//import edu.uci.ics.jung.visualization.control.ModalLensGraphMouse;
import edu.uci.ics.jung.visualization.control.ScalingControl;
import edu.uci.ics.jung.visualization.decorators.DefaultVertexIconTransformer;
//import edu.uci.ics.jung.visualization.decorators.EllipseVertexShapeTransformer;
import edu.uci.ics.jung.visualization.decorators.ToStringLabeller;
//import edu.uci.ics.jung.visualization.decorators.VertexIconShapeTransformer;
import edu.uci.ics.jung.visualization.layout.LayoutTransition;
import edu.uci.ics.jung.visualization.renderers.Renderer;
//import edu.uci.ics.jung.visualization.transform.LensSupport;
import edu.uci.ics.jung.visualization.util.Animator;
//import edu.uci.ics.jung.visualization.transform.shape.HyperbolicShapeTransformer;
//import edu.uci.ics.jung.visualization.transform.shape.ViewLensSupport;

public class SimpleViewer extends JApplet
{
	private static final long serialVersionUID = -5512498807559660953L;
	private static final int X_INIT = 200;
	private static final int Y_INIT = 200;
	
    //private static final int EDGE_LENGTH = 100;
	private VisualizationViewer<Vertex, Edge> visualizationServer;
	private Graph<Vertex, Edge> g;
	private Layout<Vertex, Edge> layout;
    private ScalingControl scaler = new CrossoverScalingControl();
    //private LensSupport hyperbolicViewSupport;
    protected static Graph<? extends Object, ? extends Object>[] g_array;
    protected static int graph_index;
    private RepositoryServiceClient sc = null; 
    private JComboBox jcb;
    
    public SimpleViewer()
    {
    }
    
    public static void main(String args[])
    {
		SimpleViewer sv = new SimpleViewer();
		
		JFrame frame = new JFrame("Semantic Turkey Graph Viewer");
		frame.setDefaultCloseOperation(JFrame.EXIT_ON_CLOSE);
		frame.getContentPane().add(sv);
        sv.init();
        sv.start();
        
        frame.pack();
		frame.setVisible(true);
    }
    
	@SuppressWarnings({ "serial" })
	public void init()
	{
    	Graph<Vertex, Edge> ig = Graphs.<Vertex, Edge>synchronizedDirectedGraph(new DirectedSparseMultigraph<Vertex, Edge>());
        ObservableGraph<Vertex, Edge> og = new ObservableGraph<Vertex, Edge>(ig);
        og.addGraphEventListener(new GraphEventListener<Vertex, Edge>() {
			public void handleGraphEvent(GraphEvent<Vertex, Edge> evt) {
				//System.err.println("got "+evt);
			}});
        g = og;

        layout = new FRLayout<Vertex, Edge>(g); //, new ConstantTransformer<Integer>(EDGE_LENGTH));
        layout.setSize(new Dimension(this.getWidth(), this.getHeight()));
		
		Relaxer relaxer = new VisRunner((IterativeContext)layout);
		relaxer.stop();
		relaxer.prerelax();

        JRootPane rp = this.getRootPane();
        rp.putClientProperty("defeatSystemEventQueueCheck", Boolean.TRUE);
        getContentPane().setLayout(new BorderLayout());
        getContentPane().setBackground(java.awt.Color.lightGray);
        getContentPane().setFont(new Font("Serif", Font.PLAIN, 10));

        visualizationServer = new VisualizationViewer<Vertex, Edge>(layout, layout.getSize());

        //
		// Edge settings...
        visualizationServer.getRenderContext().setEdgeLabelTransformer(new ToStringLabeller<Edge>());
		
        // Vertex settings...
        visualizationServer.getRenderContext().setVertexLabelTransformer(new ToStringLabeller<Vertex>());
		visualizationServer.getRenderer().getVertexLabelRenderer().setPosition(Renderer.VertexLabel.Position.S);
		visualizationServer.setVertexToolTipTransformer(new Transformer<Vertex, String>() {
			public String transform(Vertex v) 
			{
				return v.getTooltip();
			}
		});
        
		//visualizationServer.getModel().getRelaxer().setSleepTime(500);
		DefaultModalGraphMouse<Vertex, Edge> graphMouse = new DefaultModalGraphMouse<Vertex, Edge>();
		visualizationServer.setGraphMouse(graphMouse);
		visualizationServer.addGraphMouseListener(new STGraphMouseListener<Vertex>());

		//final STVertexIconShapeTransformer<Vertex> vertexImageShapeFunction = new STVertexIconShapeTransformer<Vertex>(new EllipseVertexShapeTransformer<Vertex>());
		//visualizationServer.getRenderContext().setVertexShapeTransformer(vertexImageShapeFunction);

		final STVertexIconTransformer<Vertex> vertexIconTransformer = new STVertexIconTransformer<Vertex>();
        visualizationServer.getRenderContext().setVertexIconTransformer(vertexIconTransformer);

        /*
        hyperbolicViewSupport = 
			new ViewLensSupport<Vertex, Edge>(visualizationServer, new HyperbolicShapeTransformer(visualizationServer, 
					visualizationServer.getRenderContext().getMultiLayerTransformer().getTransformer(Layer.VIEW)), 
              new ModalLensGraphMouse());
		
		graphMouse.addItemListener(hyperbolicViewSupport.getGraphMouse().getModeListener());
		*/
		visualizationServer.addComponentListener(new ComponentAdapter() {
			/**
			 * @see java.awt.event.ComponentAdapter#componentResized(java.awt.event.ComponentEvent)
			 */
			@Override
			public void componentResized(ComponentEvent arg0) {
				super.componentResized(arg0);
				layout.setSize(arg0.getComponent().getSize());
				//System.out.println("height: " + layout.getSize().height + "width: " + layout.getSize().width);
			}});

		JComboBox modeBox = graphMouse.getModeComboBox();
        //modeBox.addItemListener(((DefaultModalGraphMouse<Vertex, Edge>)visualizationServer.getGraphMouse()).getModeListener());
        modeBox.addItemListener(graphMouse.getModeListener());

        JButton plus = new JButton("+");
        plus.addActionListener(new ActionListener() {
            public void actionPerformed(ActionEvent e) {
                scaler.scale(visualizationServer, 1.1f, visualizationServer.getCenter());
            }
        });
        JButton minus = new JButton("-");
        minus.addActionListener(new ActionListener() {
            public void actionPerformed(ActionEvent e) {
                scaler.scale(visualizationServer, 1/1.1f, visualizationServer.getCenter());
            }
        });

        JPanel jp = new JPanel();
        jp.setBackground(Color.WHITE);
        jp.setLayout(new BorderLayout());
        jp.add(visualizationServer, BorderLayout.WEST);
        Class<?>[] combos = getCombos();
        jcb = new JComboBox(combos);
        // use a renderer to shorten the layout name presentation
        jcb.setRenderer(new DefaultListCellRenderer() {
            public Component getListCellRendererComponent(JList list, Object value, int index, boolean isSelected, boolean cellHasFocus) {
                String valueString = value.toString();
                valueString = valueString.substring(valueString.lastIndexOf('.')+1);
                return super.getListCellRendererComponent(list, valueString, index, isSelected,
                        cellHasFocus);
            }
        });
        jcb.addActionListener(new LayoutChooser(jcb, g, visualizationServer));
        jcb.setSelectedItem(FRLayout.class);
        graph_index = jcb.getSelectedIndex();
        
        JPanel control_panel = new JPanel(new GridLayout(2,1));
        JPanel topControls = new JPanel();
        JPanel bottomControls = new JPanel();
        control_panel.add(topControls);
        control_panel.add(bottomControls);
        jp.add(control_panel, BorderLayout.NORTH);

        /*
        final JRadioButton hyperView = new JRadioButton("Hyperbolic View");
        hyperView.addItemListener(new ItemListener(){
            public void itemStateChanged(ItemEvent e) {
                hyperbolicViewSupport.activate(e.getStateChange() == ItemEvent.SELECTED);
            }
        });
        */
        //final JComboBox graph_chooser = new JComboBox(graph_names);
        
        //graph_chooser.addActionListener(new GraphChooser(jcb));
        
        topControls.add(jcb);
        //topControls.add(graph_chooser);
        bottomControls.add(plus);
        bottomControls.add(minus);
        bottomControls.add(modeBox);
        //bottomControls.add(hyperView);
        getContentPane().add(jp);
	}
	
	public void start()
	{
		try 
		{
			XMLHelp.initialize();
		} 
		catch (Exception e) 
		{
			e.printStackTrace();
		}
		
		ProjectServiceClient psc = new ProjectServiceClient();
        String model = psc.getModelType();
        if (model.equals(ProjectServiceClient.OWL_MODEL_TYPE))
        	sc = new OWLServiceClient();
        else if (model.equals(ProjectServiceClient.SKOS_MODEL_TYPE))
        	sc = new SKOSServiceClient();
        else if (model.equals(ProjectServiceClient.SKOSXL_MODEL_TYPE))
        	sc = new SKOSXLServiceClient();
        else
        {
            JOptionPane.showMessageDialog(this,
            		"Model: " + model + " isn't supported",
            		"Semantic Turkey graph",
            		JOptionPane.WARNING_MESSAGE,
            		null);
            
        	return;
        }
        validate();
		Vertex v = sc.getRootVertex();
		layout.setLocation(v, new Point(X_INIT, Y_INIT));
		g.addVertex(v);
	}
	
    class STVertexIconTransformer<V> extends DefaultVertexIconTransformer<Vertex> implements Transformer<Vertex,Icon> 
    {
        private Map<String, Icon> icons = new HashMap<String, Icon>();
        
    	public STVertexIconTransformer()
    	{
            Icon icon = null;

            icon = loadIcon("/it/uniroma2/art/semanticturkey/images/turkeyCircle.gif");
            icons.put(OWLVertex.OWL_ICON_CLASS, icon);
            
            icon = loadIcon("/it/uniroma2/art/semanticturkey/images/individual20x20.png");
            icons.put(OWLVertex.OWL_ICON_INDIVIDUAL, icon);
    		
            icon = loadIcon("/it/uniroma2/art/semanticturkey/images/prop20x20.png");
            icons.put(OWLVertex.OWL_ICON_GENERIC, icon);
            
            icon = loadIcon("/it/uniroma2/art/semanticturkey/images/concept20x20.png");
            icons.put(SKOSVertex.SKOS_ICON_CONCEPT, icon);
    	}
    	
    	private Icon loadIcon(String iconName)
    	{
			ImageIcon ic = new ImageIcon(getClass().getResource(iconName));
        	LayeredIcon lc = new LayeredIcon(scale(ic).getImage());
			return (Icon) lc;
    	}
    	
		public Icon transform(Vertex v) 
		{
			if (v.getIconName() != null)
			{
				Icon icon = icons.get(v.getIconName());
				return icon;
			}

			return null;
		}
		
		private ImageIcon scale(ImageIcon ii)
		{
			Image img = ii.getImage();  
			Image newimg = img.getScaledInstance(20, 20,  java.awt.Image.SCALE_SMOOTH);  
			return new ImageIcon(newimg);  			
		}
    }
    
    /*
    class STVertexIconShapeTransformer<V> extends VertexIconShapeTransformer<Vertex> 
    {
        boolean shapeImages = true;

        public STVertexIconShapeTransformer(Transformer<Vertex, Shape> delegate) 
        {
            super(delegate);
        }

        public boolean isShapeImages() 
        {
            return shapeImages;
        }
        public void setShapeImages(boolean shapeImages) 
        {
            shapeMap.clear();
            this.shapeImages = shapeImages;
        }

		private ImageIcon scale(ImageIcon ii)
		{
			Image img = ii.getImage();  
			Image newimg = img.getScaledInstance(20, 20,  java.awt.Image.SCALE_SMOOTH);  
			return new ImageIcon(newimg);  			
		}
		
        public Shape transform(Vertex v) 
        {
			Icon icon = null;
			if (v.getIconName() != null)
			{
				ImageIcon ic = new ImageIcon(getClass().getResource(v.getIconName()));
	        	LayeredIcon lc = new LayeredIcon(scale(ic).getImage());
				icon = (Icon) lc;
			}

			if (icon != null && icon instanceof ImageIcon) 
			{
				Image image = ((ImageIcon) icon).getImage();

				Shape shape = shapeMap.get(image);
				if (shape == null) 
				{
					if (shapeImages) 
					{
						shape = FourPassImageShaper.getShape(image, 30);
					} 
					else 
					{
						shape = new Rectangle2D.Float(0, 0, 
								image.getWidth(null), image.getHeight(null));
					}
                    if(shape.getBounds().getWidth() > 0 && shape.getBounds().getHeight() > 0) 
                    {
                        int width = image.getWidth(null);
                        int height = image.getHeight(null);
                        AffineTransform transform = 
                            AffineTransform.getTranslateInstance(-width / 2, -height / 2);
                        shape = transform.createTransformedShape(shape);
                        shapeMap.put(image, shape);
                    }
				}
				return shape;
			} 
			else 
			{
				return delegate.transform(v);
			}
		}
    }
    */
    
    /**
     * A nested class to demo the GraphMouseListener finding the
     * right vertices after zoom/pan
     */
    class STGraphMouseListener<V> implements GraphMouseListener<Vertex> 
    {
		public void graphClicked(Vertex v, MouseEvent me) 
		{
			Vector<Pair<Vertex, Edge>> vs = sc.getChildrenOf(v);
			if (vs == null)
				return;
			
			Vertex t;
			if (!v.isExpanded())
			{
				visualizationServer.getRenderContext().getPickedVertexState().clear();
				visualizationServer.getRenderContext().getPickedEdgeState().clear();
		    	
				v.setExpanded(true);
				for (Pair<Vertex, Edge> pi : vs)
				{
					if ((t = search(pi.getK())) == null)
					{
						g.addVertex(pi.getK());
						g.addEdge(pi.getL(), v, pi.getK());
					}	
					else
						g.addEdge(pi.getL(), v, t);
				}
				refreshGraph();
			}
			else
			{
				boolean refreshReq = false;
				Collection<Vertex> ns = g.getSuccessors(v);
				Iterator<Vertex> it = ns.iterator();
				//
				// Searching for removed vertexes
				while (it.hasNext())
				{
					Vertex vi = it.next();
					//
					// A vertex previously added to the graph has been removed?
					if (!exist(vi, vs))
					{
						refreshReq = true;
						g.removeVertex(vi);
						//System.out.println("Removed child from: " + v.getName() + " [" + vi.getName() + "]");
					}
				}
				//
				// Searching for new vertexes
				ns = g.getSuccessors(v); // Re-read successors of currently vertex: maybe some vertexes has been removed
				for (Pair<Vertex, Edge> pi : vs)
				{
					if (!exist(pi, ns))
					{
						refreshReq = true;
						if ((t = search(pi.getK())) == null)
						{
							g.addVertex(pi.getK());
							g.addEdge(pi.getL(), v, pi.getK());
						}	
						else
							g.addEdge(pi.getL(), v, t);
						
						//g.addVertex(pi.getK());
						//g.addEdge(pi.getL(), v, pi.getK());
						//System.out.println("Added child to: " + v.getName() + " [" + pi.getK().getName() + "]");
					}
				}
				
				// Need refresh?
				if (refreshReq)
					visualizationServer.repaint();
			}
		}
		
		private void refreshGraph()
		{
            layout.initialize();
    		Relaxer relaxer = new VisRunner((IterativeContext)layout);
    		relaxer.stop();
    		relaxer.prerelax();
			LayoutTransition<Vertex, Edge> lt =
				new LayoutTransition<Vertex, Edge>(visualizationServer, visualizationServer.getGraphLayout(),
						getSelectedLayout());
			Animator animator = new Animator(lt);
			animator.start();
			visualizationServer.repaint();
		}
		
		private boolean exist(Vertex v, Vector<Pair<Vertex, Edge>> vs)
		{
			for (Pair<Vertex, Edge> pi : vs)
			{
				if (v.equals(pi.getK()))
					return true;
			}
			
			return false;
		}
		
		private boolean exist(Pair<Vertex, Edge> p, Collection<Vertex> vs)
		{
			Iterator<Vertex> it = vs.iterator();
			
			while (it.hasNext())
			{
				Vertex vi = it.next();
				if (p.getK().equals(vi))
					return true;
			}
			
			return false;
		}

		private Vertex search(Vertex v)
		{
			Collection<Vertex> c = g.getVertices();
			Iterator<Vertex> it = c.iterator();

			while (it.hasNext())
			{
				Vertex v2 = it.next();
				if (v.equals(v2))
					return v2;
			}
			
			return null;
		}
		
		public void graphPressed(Vertex v, MouseEvent me) 
		{
		    //System.err.println("Vertex "+v+" was pressed at ("+me.getX()+","+me.getY()+")");
		}
		
		public void graphReleased(Vertex v, MouseEvent me) 
		{
		    //System.err.println("Vertex "+v+" was released at ("+me.getX()+","+me.getY()+")");
		}
    }
    
    @SuppressWarnings({ "unchecked", "rawtypes" })
    private static Class<? extends Layout>[] getCombos()
    {
        List<Class<? extends Layout>> layouts = new ArrayList<Class<? extends Layout>>();
        layouts.add(KKLayout.class);
        layouts.add(FRLayout.class);
        layouts.add(FRLayout2.class);
        layouts.add(CircleLayout.class);
        layouts.add(SpringLayout.class);
        layouts.add(SpringLayout2.class);
        layouts.add(ISOMLayout.class);
        layouts.add(DAGLayout.class);
        return layouts.toArray(new Class[0]);
    }
    
	@SuppressWarnings("unchecked")
	public Layout<Vertex, Edge> getSelectedLayout() 
	{
        Class<? extends Layout<Vertex, Edge>> layoutC = (Class<? extends Layout<Vertex, Edge>>) jcb.getSelectedItem();
        try
        {
            Constructor<? extends Layout<Vertex, Edge>> constructor = layoutC.getConstructor(new Class[] {Graph.class});
            Object o = constructor.newInstance(g);
            Layout<Vertex, Edge> l = (Layout<Vertex, Edge>) o;
            l.setInitializer(visualizationServer.getGraphLayout());
            l.setSize(visualizationServer.getSize());
            return l;
        }
        catch (Exception e)
        {
            e.printStackTrace();
        }
		return null;
	}

	private static final class LayoutChooser implements ActionListener
    {
        private final JComboBox jcb;
        private final VisualizationViewer<Vertex, Edge> vv;
        private final Graph<Vertex, Edge> graph;
        
        private LayoutChooser(JComboBox jcb, Graph<Vertex, Edge> graph, VisualizationViewer<Vertex, Edge> vv)
        {
            super();
            this.jcb = jcb;
            this.graph = graph;
            this.vv = vv;
        }

        @SuppressWarnings("unchecked")
		public void actionPerformed(ActionEvent arg0)
        {
        	/*
            Object[] constructorArgs = { 
            		g_array[graph_index]
            };
			*/
            Class<? extends Layout<Vertex, Edge>> layoutC = (Class<? extends Layout<Vertex, Edge>>) jcb.getSelectedItem();
            try
            {
                Constructor<? extends Layout<Vertex, Edge>> constructor = layoutC.getConstructor(new Class[] {Graph.class});
                Object o = constructor.newInstance(graph);
                Layout<Vertex, Edge> l = (Layout<Vertex, Edge>) o;
                l.setInitializer(vv.getGraphLayout());
                l.setSize(vv.getSize());
                
				LayoutTransition<Vertex, Edge> lt = new LayoutTransition<Vertex, Edge>(vv, vv.getGraphLayout(), l);
				Animator animator = new Animator(lt);
				animator.start();
				vv.getRenderContext().getMultiLayerTransformer().setToIdentity();
				vv.repaint();
            }
            catch (Exception e)
            {
                e.printStackTrace();
            }
        }
    }
}
