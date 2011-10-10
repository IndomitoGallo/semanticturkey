package it.uniroma2.art.semanticturkey.graph;

public class Pair<K, L> 
{
	K k;
	L l;
	
	public Pair(K k, L l)
	{
		this.k = k;
		this.l = l;
	}

	public K getK() {
		return k;
	}

	public L getL() {
		return l;
	}
}
