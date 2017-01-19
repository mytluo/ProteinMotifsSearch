ABOUT:

Searches a protein sequence for possible motifs that may elucidate possible function(s) of the protein.

Source code: http://bfx.eng.jhu.edu/mluozha1/final/motif_search.tar.gz
	- Includes SQL file to create the motif database

Results can be used to search annotated protein databases (UniProt, Prosite, Pfam) for possible homologues.

User instructions:

1. Input a protein sequence in the search in FASTA format, or as a pure string. Queries with invalid IUPAC codes for amino acids will not be accepted.

2. A results table will return listing motifs found, and where in the sequence they were found. The motifs listed will describe the family they are a part of, the Prosite notation for the general consensus sequence, and any additional information that may be helpful in determining if the match is plausible or valid.

Consensus sequences were derived from:
Aitken, A. (2003). Protein Consensus Sequence Motifs. Protein Sequencing Protocols, 465-485. doi:10.1385/1-59259-342-9:465

